import { useState } from 'react';
import { api } from '../api/client';

const HORARIOS = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00'];

const estadoInicial = {
  cliente: '',
  email: '',
  telefono: '',
  servicio: '',
  fecha: '',
  hora: '',
  codigoCupon: '',
  esClienteVIP: false,
};

export default function FormularioReserva({ servicios, onCreado }) {
  const [form, setForm] = useState(estadoInicial);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  function handleChange(evento) {
    const { name, value, type, checked } = evento.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setEnviando(true);
    setMensaje(null);
    setError(null);

    try {
      const respuesta = await api.crearTurno(form);
      setMensaje(
        `Turno confirmado para ${respuesta.data.cliente}. Total: $${respuesta.data.precioFinal.toLocaleString('es-AR')}`
      );
      setForm(estadoInicial);
      onCreado?.();
    } catch (err) {
      setError(err.payload?.message || err.message);
    } finally {
      setEnviando(false);
    }
  }

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <section id="reserva" className="seccion-reserva">
      <div className="contenedor narrow">
        <h2>Solicitá tu turno</h2>
        <p className="seccion-intro">
          Completá el formulario. Cupón <strong>PROMO20</strong> o cliente VIP = 20% off.
        </p>

        <form className="formulario" onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="cliente">Nombre y apellido *</label>
            <input
              id="cliente"
              name="cliente"
              value={form.cliente}
              onChange={handleChange}
              required
              placeholder="Ej: Mariana Rossi"
            />
          </div>

          <div className="campo">
            <label htmlFor="email">Correo electrónico *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="campo">
            <label htmlFor="telefono">Teléfono *</label>
            <input
              id="telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              required
              placeholder="1122334455"
            />
          </div>

          <div className="campo">
            <label htmlFor="servicio">Servicio *</label>
            <select
              id="servicio"
              name="servicio"
              value={form.servicio}
              onChange={handleChange}
              required
            >
              <option value="">-- Seleccioná --</option>
              {servicios.map((s) => (
                <option key={s.codigo} value={s.codigo}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grupo-doble">
            <div className="campo">
              <label htmlFor="fecha">Fecha *</label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                min={hoy}
                value={form.fecha}
                onChange={handleChange}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="hora">Horario *</label>
              <select
                id="hora"
                name="hora"
                value={form.hora}
                onChange={handleChange}
                required
              >
                <option value="">-- Hora --</option>
                {HORARIOS.map((h) => (
                  <option key={h} value={h}>
                    {h} hs
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grupo-doble">
            <div className="campo">
              <label htmlFor="codigoCupon">Cupón</label>
              <input
                id="codigoCupon"
                name="codigoCupon"
                value={form.codigoCupon}
                onChange={handleChange}
                placeholder="PROMO20"
              />
            </div>
            <div className="campo campo-check">
              <label className="check-label">
                <input
                  type="checkbox"
                  name="esClienteVIP"
                  checked={form.esClienteVIP}
                  onChange={handleChange}
                />
                Soy cliente VIP
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primario btn-submit" disabled={enviando}>
            {enviando ? 'Reservando...' : 'Confirmar reserva'}
          </button>
        </form>

        {mensaje && <div className="confirmacion">{mensaje}</div>}
        {error && <div className="error-msg">{error}</div>}
      </div>
    </section>
  );
}
