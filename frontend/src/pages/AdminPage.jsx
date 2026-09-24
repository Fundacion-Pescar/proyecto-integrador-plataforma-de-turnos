import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../api/client';

const ESTADOS = [
  'TODOS',
  'PENDIENTE',
  'CONFIRMADO',
  'COMPLETADO',
  'CANCELADO',
  'CANCELADO_POR_EXPIRACION',
];

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
}

export default function AdminPage() {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [accionId, setAccionId] = useState(null);

  const cargarTurnos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await api.getTurnos();
      setTurnos(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return turnos.filter((t) => {
      const okEstado = filtroEstado === 'TODOS' || t.estado === filtroEstado;
      const okBusqueda =
        !q ||
        t.cliente?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.servicio?.toLowerCase().includes(q) ||
        String(t.id).includes(q);
      return okEstado && okBusqueda;
    });
  }, [turnos, filtroEstado, busqueda]);

  const resumen = useMemo(() => {
    return {
      total: turnos.length,
      confirmados: turnos.filter((t) => t.estado === 'CONFIRMADO').length,
      pendientes: turnos.filter((t) => t.estado === 'PENDIENTE').length,
      completados: turnos.filter((t) => t.estado === 'COMPLETADO').length,
      cancelados: turnos.filter((t) =>
        ['CANCELADO', 'CANCELADO_POR_EXPIRACION'].includes(t.estado)
      ).length,
    };
  }, [turnos]);

  async function ejecutar(id, accion) {
    setAccionId(id);
    try {
      if (accion === 'cancelar') {
        await api.cancelarTurno(id);
      } else if (accion === 'confirmar') {
        await api.confirmarTurno(id);
      } else if (accion === 'completar') {
        await api.actualizarTurno(id, { estado: 'COMPLETADO' });
      } else if (accion === 'pendiente') {
        await api.actualizarTurno(id, { estado: 'PENDIENTE' });
      }
      await cargarTurnos();
    } catch (err) {
      alert(err.message);
    } finally {
      setAccionId(null);
    }
  }

  return (
    <div className="admin-layout">
      <Navbar variante="admin" />

      <main className="admin-main">
        <div className="contenedor">
          <header className="admin-header">
            <div>
              <h1>Panel de turnos</h1>
              <p>Gestión completa de la agenda del consultorio.</p>
            </div>
            <button type="button" className="btn btn-primario" onClick={cargarTurnos}>
              Actualizar
            </button>
          </header>

          <div className="admin-stats">
            <div className="stat">
              <span>Total</span>
              <strong>{resumen.total}</strong>
            </div>
            <div className="stat">
              <span>Confirmados</span>
              <strong>{resumen.confirmados}</strong>
            </div>
            <div className="stat">
              <span>Pendientes</span>
              <strong>{resumen.pendientes}</strong>
            </div>
            <div className="stat">
              <span>Completados</span>
              <strong>{resumen.completados}</strong>
            </div>
            <div className="stat">
              <span>Cancelados</span>
              <strong>{resumen.cancelados}</strong>
            </div>
          </div>

          <div className="admin-filtros">
            <input
              type="search"
              placeholder="Buscar por paciente, email, servicio o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado === 'TODOS' ? 'Todos los estados' : estado}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-msg">{error}</div>}
          {cargando && <p className="vacio">Cargando turnos...</p>}

          {!cargando && filtrados.length === 0 && (
            <p className="vacio">No hay turnos para mostrar con estos filtros.</p>
          )}

          {!cargando && filtrados.length > 0 && (
            <div className="tabla-wrap">
              <table className="tabla-turnos">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Paciente</th>
                    <th>Servicio</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((turno) => (
                    <tr key={turno.id}>
                      <td>#{turno.id}</td>
                      <td>
                        <strong>{turno.cliente}</strong>
                        <div className="meta">{turno.email}</div>
                        <div className="meta">{turno.telefono || '—'}</div>
                      </td>
                      <td>{turno.servicio}</td>
                      <td>{turno.fecha}</td>
                      <td>{turno.hora}</td>
                      <td>{formatearPrecio(turno.precioFinal)}</td>
                      <td>
                        <span className={`badge-estado estado-${turno.estado.toLowerCase()}`}>
                          {turno.estado}
                        </span>
                      </td>
                      <td>
                        <div className="acciones">
                          {turno.estado !== 'CONFIRMADO' &&
                            !String(turno.estado).startsWith('CANCELADO') && (
                              <button
                                type="button"
                                disabled={accionId === turno.id}
                                onClick={() => ejecutar(turno.id, 'confirmar')}
                              >
                                Confirmar
                              </button>
                            )}
                          {turno.estado === 'CONFIRMADO' && (
                            <button
                              type="button"
                              disabled={accionId === turno.id}
                              onClick={() => ejecutar(turno.id, 'completar')}
                            >
                              Completar
                            </button>
                          )}
                          {!String(turno.estado).startsWith('CANCELADO') &&
                            turno.estado !== 'COMPLETADO' && (
                              <button
                                type="button"
                                className="peligro"
                                disabled={accionId === turno.id}
                                onClick={() => ejecutar(turno.id, 'cancelar')}
                              >
                                Cancelar
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
