import { useCallback, useEffect, useRef, useState } from 'react';
import AppShell from '../components/AppShell';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../api/client';

const vacio = {
  codigo: '',
  nombre: '',
  descripcion: '',
  duracionMinutos: 30,
  precio: 0,
  mostrarPrecio: true,
  activo: true,
};

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [pedirDesactivar, setPedirDesactivar] = useState(false);
  const [desactivando, setDesactivando] = useState(false);
  const nombreRef = useRef(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await api.getServiciosAdmin();
      setServicios(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (modalAbierto) {
      requestAnimationFrame(() => nombreRef.current?.focus());
    }
  }, [modalAbierto]);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'duracionMinutos' || name === 'precio'
            ? Number(value)
            : value,
    }));
  }

  function abrirNuevo() {
    setEditandoId(null);
    setForm(vacio);
    setMensaje(null);
    setPedirDesactivar(false);
    setModalAbierto(true);
  }

  function abrirEdicion(servicio) {
    setEditandoId(servicio.id);
    setForm({
      codigo: servicio.codigo || '',
      nombre: servicio.nombre || '',
      descripcion: servicio.descripcion || '',
      duracionMinutos: Number(servicio.duracionMinutos) || 30,
      precio: Number(servicio.precio) || 0,
      mostrarPrecio: servicio.mostrarPrecio !== false,
      activo: Boolean(servicio.activo),
    });
    setMensaje(null);
    setPedirDesactivar(false);
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando || desactivando) return;
    setModalAbierto(false);
    setEditandoId(null);
    setForm(vacio);
    setMensaje(null);
    setPedirDesactivar(false);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      if (editandoId) {
        await api.actualizarServicio(editandoId, {
          nombre: form.nombre,
          descripcion: form.descripcion,
          duracionMinutos: form.duracionMinutos,
          precio: form.precio,
          mostrarPrecio: form.mostrarPrecio,
          activo: form.activo,
        });
      } else {
        await api.crearServicio({
          codigo: form.codigo,
          nombre: form.nombre,
          descripcion: form.descripcion,
          duracionMinutos: form.duracionMinutos,
          precio: form.precio,
          mostrarPrecio: form.mostrarPrecio,
        });
      }
      setModalAbierto(false);
      setEditandoId(null);
      setForm(vacio);
      await cargar();
    } catch (err) {
      setMensaje(err.payload?.message || err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarDesactivar() {
    if (!editandoId) return;
    setDesactivando(true);
    try {
      await api.eliminarServicio(editandoId);
      setPedirDesactivar(false);
      setModalAbierto(false);
      setEditandoId(null);
      setForm(vacio);
      await cargar();
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setDesactivando(false);
    }
  }

  async function reactivarDesdeModal() {
    if (!editandoId) return;
    setGuardando(true);
    setMensaje(null);
    try {
      await api.actualizarServicio(editandoId, {
        nombre: form.nombre,
        descripcion: form.descripcion,
        duracionMinutos: form.duracionMinutos,
        precio: form.precio,
        mostrarPrecio: form.mostrarPrecio,
        activo: true,
      });
      setForm((prev) => ({ ...prev, activo: true }));
      await cargar();
    } catch (err) {
      setMensaje(err.payload?.message || err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <AppShell
      titulo="Servicios"
      subtitulo="Hacé clic en un servicio para editarlo. Usá “Nuevo servicio” para dar de alta."
      acciones={
        <div className="header-actions">
          <button type="button" className="btn btn-secundario-admin" onClick={cargar}>
            Actualizar
          </button>
          <button type="button" className="btn btn-primario" onClick={abrirNuevo}>
            Nuevo servicio
          </button>
        </div>
      }
    >
      {error && <div className="error-msg">{error}</div>}
      {cargando && <p className="vacio">Cargando catálogo...</p>}

      {!cargando && servicios.length === 0 && (
        <p className="vacio">Todavía no hay servicios. Creá el primero con “Nuevo servicio”.</p>
      )}

      {!cargando && servicios.length > 0 && (
        <div className="tabla-wrap">
          <table className="tabla-turnos tabla-clickable">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Duración</th>
                <th>Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr
                  key={s.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => abrirEdicion(s)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      abrirEdicion(s);
                    }
                  }}
                >
                  <td><code>{s.codigo}</code></td>
                  <td>
                    <strong>{s.nombre}</strong>
                    <div className="meta">{s.descripcion || '—'}</div>
                  </td>
                  <td>{s.duracionMinutos} min</td>
                  <td>
                    {s.mostrarPrecio === false
                      ? <span className="meta">Oculto</span>
                      : formatearPrecio(s.precio)}
                  </td>
                  <td>
                    <span className={`badge-estado ${s.activo ? 'estado-confirmado' : 'estado-cancelado'}`}>
                      {s.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <div className="modal-overlay" role="presentation" onClick={cerrarModal}>
          <div
            className="modal-dialog modal-form"
            role="dialog"
            aria-modal="true"
            aria-labelledby="servicio-modal-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-form-header">
              <h2 id="servicio-modal-titulo">
                {editandoId ? `Editar servicio #${editandoId}` : 'Nuevo servicio'}
              </h2>
              <button
                type="button"
                className="modal-cerrar"
                onClick={cerrarModal}
                aria-label="Cerrar"
                disabled={guardando || desactivando}
              >
                ×
              </button>
            </div>

            <form className="formulario modal-form-body" onSubmit={onSubmit}>
              <div className="grupo-doble">
                <div className="campo">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    ref={nombreRef}
                    id="nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="codigo">Código {editandoId ? '(fijo)' : '(opcional)'}</label>
                  <input
                    id="codigo"
                    name="codigo"
                    value={form.codigo}
                    onChange={onChange}
                    disabled={Boolean(editandoId)}
                    placeholder="ej: limpieza"
                  />
                </div>
              </div>

              <div className="campo">
                <label htmlFor="descripcion">Descripción</label>
                <input
                  id="descripcion"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={onChange}
                />
              </div>

              <div className="grupo-doble">
                <div className="campo">
                  <label htmlFor="duracionMinutos">Duración (min) *</label>
                  <input
                    id="duracionMinutos"
                    name="duracionMinutos"
                    type="number"
                    min="5"
                    step="5"
                    value={form.duracionMinutos}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="precio">Precio *</label>
                  <div className="precio-con-check">
                    <input
                      id="precio"
                      name="precio"
                      type="number"
                      min="0"
                      step="100"
                      value={form.precio}
                      onChange={onChange}
                      required
                    />
                    <label className="check-label check-precio" htmlFor="mostrarPrecio">
                      <input
                        id="mostrarPrecio"
                        type="checkbox"
                        name="mostrarPrecio"
                        checked={form.mostrarPrecio}
                        onChange={onChange}
                      />
                      Mostrar precio
                    </label>
                  </div>
                </div>
              </div>

              {mensaje && <div className="error-msg">{mensaje}</div>}

              <div className="modal-actions modal-actions-spread">
                <div className="modal-actions-left">
                  {editandoId && form.activo && (
                    <button
                      type="button"
                      className="btn btn-peligro"
                      onClick={() => setPedirDesactivar(true)}
                      disabled={guardando || desactivando}
                    >
                      Desactivar
                    </button>
                  )}
                  {editandoId && !form.activo && (
                    <button
                      type="button"
                      className="btn btn-secundario-admin"
                      onClick={reactivarDesdeModal}
                      disabled={guardando || desactivando}
                    >
                      Reactivar
                    </button>
                  )}
                </div>
                <div className="modal-actions-right">
                  <button
                    type="button"
                    className="btn btn-secundario-admin"
                    onClick={cerrarModal}
                    disabled={guardando || desactivando}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primario" disabled={guardando || desactivando}>
                    {guardando
                      ? 'Guardando...'
                      : editandoId
                        ? 'Guardar cambios'
                        : 'Crear servicio'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        abierto={pedirDesactivar}
        titulo="Desactivar servicio"
        mensaje={`¿Querés desactivar “${form.nombre}”? Dejará de aparecer en las reservas nuevas.`}
        textoConfirmar="Sí, desactivar"
        textoCancelar="Cancelar"
        peligro
        cargando={desactivando}
        onConfirmar={confirmarDesactivar}
        onCancelar={() => !desactivando && setPedirDesactivar(false)}
      />
    </AppShell>
  );
}
