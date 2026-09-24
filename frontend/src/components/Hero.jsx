export default function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="hero-fondo" aria-hidden="true" />
      <div className="contenedor hero-contenido">
        <p className="hero-marca">OdontoTurno</p>
        <h1>Tu sonrisa, en el horario que te conviene</h1>
        <p className="hero-texto">
          Reservá turnos online en nuestro consultorio odontológico. Confirmación
          inmediata, sin llamadas ni esperas.
        </p>
        <div className="hero-acciones">
          <a href="#reserva" className="btn btn-primario">
            Reservar turno
          </a>
          <a href="#servicios" className="btn btn-secundario">
            Ver servicios
          </a>
        </div>
      </div>
    </section>
  );
}
