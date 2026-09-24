import { api } from '../api/client';

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
}

export default function ListaTurnos({ turnos, cargando, onActualizar }) {
  async function cancelar(id) {
    try {
      await api.cancelarTurno(id);
      onActualizar?.();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  const activos = turnos.filter((t) => t.estado === 'CONFIRMADO' || t.estado === 'PENDIENTE');

  return (
    <section id="turnos" className="seccion-turnos">
      <div className="contenedor">
        <h2>Turnos registrados</h2>
        <p className="seccion-intro">Datos en vivo desde la API Express + SQLite.</p>

        {cargando && <p className="vacio">Cargando turnos...</p>}

        {!cargando && activos.length === 0 && (
          <p className="vacio">Todavía no hay turnos confirmados.</p>
        )}

        <ul className="lista-turnos">
          {activos.map((turno) => (
            <li key={turno.id} className="item-turno">
              <div>
                <strong>{turno.cliente}</strong>
                <p className="meta">
                  {turno.servicio} · {turno.fecha} {turno.hora} hs
                </p>
                <p className="meta">
                  {formatearPrecio(turno.precioFinal)} · {turno.estado}
                </p>
              </div>
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => cancelar(turno.id)}
              >
                Cancelar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
