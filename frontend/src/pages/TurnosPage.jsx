import { useCallback, useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import listPlugin from '@fullcalendar/react/list';
import interactionPlugin from '@fullcalendar/react/interaction';
import classicThemePlugin from '@fullcalendar/react/themes/classic';
import esLocale from '@fullcalendar/core/locales/es';

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';

import AppShell from '../components/AppShell';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../api/client';

const HORARIOS = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00'];

const formInicial = {
  cliente: '',
  email: '',
  telefono: '',
  servicio: '',
  fecha: '',
  hora: '',
  codigoCupon: '',
  esClienteVIP: false,
};

const COLORES = {
  CONFIRMADO: '#0f766e',
  PENDIENTE: '#d97706',
  COMPLETADO: '#15803d',
  CANCELADO: '#94a3b8',
  CANCELADO_POR_EXPIRACION: '#94a3b8',
};

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
}

function padHora(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function redondearHoraCercana(horaStr) {
  if (HORARIOS.includes(horaStr)) return horaStr;
  const [h] = horaStr.split(':').map(Number);
  const candidatas = HORARIOS.map((x) => {
    const [hh] = x.split(':').map(Number);
    return { x, diff: Math.abs(hh - h) };
  }).sort((a, b) => a.diff - b.diff);
  return candidatas[0]?.x || '09:00';
}

export default function TurnosPage() {
  const [turnos, setTurnos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [vista, setVista] = useState('calendario'); // calendario | lista
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [guardando, setGuardando] = useState(false);
  const [mensajeForm, setMensajeForm] = useState(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [accionId, setAccionId] = useState(null);
  const [cancelarId, setCancelarId] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [turnosRes, serviciosRes] = await Promise.all([
        api.getTurnos(),
        api.getServiciosPublicos(),
      ]);
      setTurnos(turnosRes.data || []);
      setServicios((serviciosRes.data || []).filter((s) => s.activo !== false));
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

  const eventos = useMemo(() => {
    return turnos
      .filter((t) => !String(t.estado).startsWith('CANCELADO'))
      .map((t) => {
        const start = `${t.fecha}T${t.hora}:00`;
        const [hh, mm] = t.hora.split(':').map(Number);
        const endDate = new Date(`${t.fecha}T${t.hora}:00`);
        endDate.setMinutes(endDate.getMinutes() + (t.duracionMinutos || 30));
        const endH = String(endDate.getHours()).padStart(2, '0');
        const endM = String(endDate.getMinutes()).padStart(2, '0');
        return {
          id: String(t.id),
          title: `${t.hora} ${t.cliente} — ${t.servicio}`,
          start,
          end: `${t.fecha}T${endH}:${endM}:00`,
          backgroundColor: COLORES[t.estado] || COLORES.CONFIRMADO,
          borderColor: COLORES[t.estado] || COLORES.CONFIRMADO,
          extendedProps: { turno: t },
        };
      });
  }, [turnos]);

  const resumen = useMemo(
    () => ({
      total: turnos.length,
      confirmados: turnos.filter((t) => t.estado === 'CONFIRMADO').length,
      pendientes: turnos.filter((t) => t.estado === 'PENDIENTE').length,
      completados: turnos.filter((t) => t.estado === 'COMPLETADO').length,
    }),
    [turnos]
  );

  function abrirNuevo(fecha = '', hora = '') {
    setForm({
      ...formInicial,
      fecha: fecha || new Date().toISOString().slice(0, 10),
      hora: hora ? redondearHoraCercana(hora) : '',
    });
    setMensajeForm(null);
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;
    setModalAbierto(false);
    setMensajeForm(null);
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function crearTurno(e) {
    e.preventDefault();
    setGuardando(true);
    setMensajeForm(null);
    try {
      await api.crearTurno(form);
      setModalAbierto(false);
      setForm(formInicial);
      await cargar();
    } catch (err) {
      setMensajeForm(err.payload?.message || err.message);
    } finally {
      setGuardando(false);
    }
  }

  function onDateClick(info) {
    const fecha = info.dateStr.slice(0, 10);
    const hora = info.dateStr.includes('T')
      ? padHora(info.date)
      : '';
    abrirNuevo(fecha, hora);
  }

  function onSelect(info) {
    const fecha = info.startStr.slice(0, 10);
    const hora = info.startStr.includes('T') ? padHora(info.start) : '';
    abrirNuevo(fecha, hora);
  }

  function onEventClick(info) {
    const turno = info.event.extendedProps.turno;
    setTurnoSeleccionado(turno);
  }

  async function ejecutar(id, accion) {
    setAccionId(id);
    try {
      if (accion === 'cancelar') await api.cancelarTurno(id);
      if (accion === 'confirmar') await api.confirmarTurno(id);
      if (accion === 'completar') await api.actualizarTurno(id, { estado: 'COMPLETADO' });
      setTurnoSeleccionado(null);
      setCancelarId(null);
      await cargar();
    } catch (err) {
      alert(err.message);
    } finally {
      setAccionId(null);
    }
  }

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <AppShell
      titulo="Agenda de turnos"
      subtitulo="Calendario del consultorio — vista día, semana o mes."
      acciones={
        <button type="button" className="btn btn-secundario-admin" onClick={cargar}>
          Actualizar
        </button>
      }
    >
      <div className="admin-stats">
        <div className="stat"><span>Total</span><strong>{resumen.total}</strong></div>
        <div className="stat"><span>Confirmados</span><strong>{resumen.confirmados}</strong></div>
        <div className="stat"><span>Pendientes</span><strong>{resumen.pendientes}</strong></div>
        <div className="stat"><span>Completados</span><strong>{resumen.completados}</strong></div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {cargando && <p className="vacio">Cargando agenda...</p>}

      {!cargando && (
        <div className="agenda-toolbar">
          <div className="vista-toggle" role="group" aria-label="Tipo de vista">
            <button
              type="button"
              className={vista === 'calendario' ? 'activo' : ''}
              onClick={() => setVista('calendario')}
            >
              Calendario
            </button>
            <button
              type="button"
              className={vista === 'lista' ? 'activo' : ''}
              onClick={() => setVista('lista')}
            >
              Lista
            </button>
          </div>
          <button type="button" className="btn btn-primario" onClick={() => abrirNuevo()}>
            Nuevo turno
          </button>
        </div>
      )}

      {!cargando && vista === 'calendario' && (
        <div className="calendario-wrap">
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
              classicThemePlugin,
            ]}
            locale={esLocale}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              list: 'Agenda',
            }}
            height="auto"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            nowIndicator
            selectable
            selectMirror
            editable={false}
            dayMaxEvents
            weekends
            events={eventos}
            dateClick={onDateClick}
            select={onSelect}
            eventClick={onEventClick}
          />
        </div>
      )}

      {!cargando && vista === 'lista' && (
        <div className="tabla-wrap">
          {turnos.length === 0 ? (
            <p className="vacio">No hay turnos cargados.</p>
          ) : (
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
                {turnos.map((turno) => (
                  <tr key={turno.id}>
                    <td>#{turno.id}</td>
                    <td>
                      <strong>{turno.cliente}</strong>
                      <div className="meta">{turno.email}</div>
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
                        <button type="button" onClick={() => setTurnoSeleccionado(turno)}>
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modalAbierto && (
        <div className="modal-overlay" role="presentation" onClick={cerrarModal}>
          <div
            className="modal-dialog modal-form"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-form-header">
              <h2>Nuevo turno</h2>
              <button type="button" className="modal-cerrar" onClick={cerrarModal} aria-label="Cerrar">
                ×
              </button>
            </div>
            <form className="formulario modal-form-body" onSubmit={crearTurno}>
              <div className="grupo-doble">
                <div className="campo">
                  <label htmlFor="cliente">Paciente *</label>
                  <input id="cliente" name="cliente" value={form.cliente} onChange={onChange} required />
                </div>
                <div className="campo">
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={onChange} required />
                </div>
              </div>
              <div className="grupo-doble">
                <div className="campo">
                  <label htmlFor="telefono">Teléfono *</label>
                  <input id="telefono" name="telefono" value={form.telefono} onChange={onChange} required />
                </div>
                <div className="campo">
                  <label htmlFor="servicio">Servicio *</label>
                  <select id="servicio" name="servicio" value={form.servicio} onChange={onChange} required>
                    <option value="">-- Seleccioná --</option>
                    {servicios.map((s) => (
                      <option key={s.codigo} value={s.codigo}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grupo-doble">
                <div className="campo">
                  <label htmlFor="fecha">Fecha *</label>
                  <input id="fecha" name="fecha" type="date" min={hoy} value={form.fecha} onChange={onChange} required />
                </div>
                <div className="campo">
                  <label htmlFor="hora">Hora *</label>
                  <select id="hora" name="hora" value={form.hora} onChange={onChange} required>
                    <option value="">-- Hora --</option>
                    {HORARIOS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grupo-doble">
                <div className="campo">
                  <label htmlFor="codigoCupon">Cupón</label>
                  <input id="codigoCupon" name="codigoCupon" value={form.codigoCupon} onChange={onChange} />
                </div>
                <div className="campo campo-check">
                  <label className="check-label">
                    <input type="checkbox" name="esClienteVIP" checked={form.esClienteVIP} onChange={onChange} />
                    Cliente VIP
                  </label>
                </div>
              </div>
              {mensajeForm && <div className="error-msg">{mensajeForm}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secundario-admin" onClick={cerrarModal} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primario" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Crear turno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {turnoSeleccionado && (
        <div className="modal-overlay" role="presentation" onClick={() => setTurnoSeleccionado(null)}>
          <div className="modal-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Turno #{turnoSeleccionado.id}</h2>
            <p>
              <strong>{turnoSeleccionado.cliente}</strong><br />
              {turnoSeleccionado.email} · {turnoSeleccionado.telefono || 'Sin teléfono'}<br />
              {turnoSeleccionado.servicio}<br />
              {turnoSeleccionado.fecha} a las {turnoSeleccionado.hora} hs<br />
              Total: {formatearPrecio(turnoSeleccionado.precioFinal)}<br />
              Estado: {turnoSeleccionado.estado}
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-secundario-admin" onClick={() => setTurnoSeleccionado(null)}>
                Cerrar
              </button>
              {turnoSeleccionado.estado !== 'CONFIRMADO' &&
                !String(turnoSeleccionado.estado).startsWith('CANCELADO') && (
                  <button
                    type="button"
                    className="btn btn-primario"
                    disabled={accionId === turnoSeleccionado.id}
                    onClick={() => ejecutar(turnoSeleccionado.id, 'confirmar')}
                  >
                    Confirmar
                  </button>
                )}
              {turnoSeleccionado.estado === 'CONFIRMADO' && (
                <button
                  type="button"
                  className="btn btn-primario"
                  disabled={accionId === turnoSeleccionado.id}
                  onClick={() => ejecutar(turnoSeleccionado.id, 'completar')}
                >
                  Completar
                </button>
              )}
              {!String(turnoSeleccionado.estado).startsWith('CANCELADO') &&
                turnoSeleccionado.estado !== 'COMPLETADO' && (
                  <button
                    type="button"
                    className="btn btn-peligro"
                    disabled={accionId === turnoSeleccionado.id}
                    onClick={() => setCancelarId(turnoSeleccionado.id)}
                  >
                    Cancelar turno
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        abierto={Boolean(cancelarId)}
        titulo="Cancelar turno"
        mensaje="¿Confirmás cancelar este turno? El horario quedará libre nuevamente."
        textoConfirmar="Sí, cancelar"
        textoCancelar="Volver"
        peligro
        cargando={accionId === cancelarId}
        onConfirmar={() => ejecutar(cancelarId, 'cancelar')}
        onCancelar={() => setCancelarId(null)}
      />
    </AppShell>
  );
}
