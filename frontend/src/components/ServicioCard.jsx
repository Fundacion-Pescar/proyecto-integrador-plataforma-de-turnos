function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
}

export default function ServicioCard({ servicio }) {
  return (
    <article className="tarjeta-servicio">
      <h3>{servicio.nombre}</h3>
      <p className="descripcion">{servicio.descripcion}</p>
      <p className="duracion">Duración: {servicio.duracionMinutos} min</p>
      <p className="precio">{formatearPrecio(servicio.precio)}</p>
    </article>
  );
}
