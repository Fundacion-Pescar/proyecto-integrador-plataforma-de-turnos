import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ServicioCard from '../components/ServicioCard';
import FormularioReserva from '../components/FormularioReserva';
import AsistenteChat from '../components/AsistenteChat';
import { api } from '../api/client';

export default function HomePage() {
  const [servicios, setServicios] = useState([]);
  const [errorCarga, setErrorCarga] = useState(null);
  const [reservaOk, setReservaOk] = useState(null);

  useEffect(() => {
    api
      .getServicios()
      .then((data) => setServicios(data.data || []))
      .catch(() =>
        setErrorCarga(
          'No se pudo conectar con el backend. ¿Está corriendo en el puerto 3000?'
        )
      );
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />

        <section id="servicios" className="seccion-servicios">
          <div className="contenedor">
            <h2>Nuestros servicios</h2>
            <p className="seccion-intro">
              Tratamientos odontológicos con agenda digital y cupos controlados.
            </p>
            {errorCarga && <p className="error-msg">{errorCarga}</p>}
            <div className="grilla-servicios">
              {servicios.map((servicio) => (
                <ServicioCard key={servicio.id} servicio={servicio} />
              ))}
            </div>
          </div>
        </section>

        <FormularioReserva
          servicios={servicios}
          onCreado={() =>
            setReservaOk('Tu turno quedó registrado. El consultorio lo verá en el panel de administración.')
          }
        />

        {reservaOk && (
          <div className="contenedor narrow">
            <div className="confirmacion">{reservaOk}</div>
          </div>
        )}
      </main>

      <footer className="pie-pagina">
        <div className="contenedor">
          <p>
            © 2026 OdontoTurno — Consultorio Odontológico. Proyecto Integrador
            Fundación Pescar.
          </p>
        </div>
      </footer>

      <AsistenteChat />
    </>
  );
}
