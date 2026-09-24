import { useState } from 'react';
import { api } from '../api/client';

export default function AsistenteChat() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState([
    {
      rol: 'asistente',
      texto: '¡Hola! Soy el asistente de OdontoTurno. Preguntame por precios, horarios o tratamientos.',
    },
  ]);

  async function enviar(evento) {
    evento.preventDefault();
    const texto = mensaje.trim();
    if (!texto) return;

    setHistorial((prev) => [...prev, { rol: 'usuario', texto }]);
    setMensaje('');
    setCargando(true);

    try {
      const data = await api.enviarChat(texto);
      setHistorial((prev) => [
        ...prev,
        { rol: 'asistente', texto: data.respuesta },
      ]);
    } catch (error) {
      setHistorial((prev) => [
        ...prev,
        { rol: 'asistente', texto: 'No pude responder ahora. Intentá de nuevo.' },
      ]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className={`chat-widget ${abierto ? 'abierto' : ''}`}>
      {abierto && (
        <div className="chat-panel">
          <header className="chat-header">
            <strong>Asistente OdontoTurno</strong>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar chat">
              ×
            </button>
          </header>
          <div className="chat-mensajes">
            {historial.map((m, i) => (
              <div key={i} className={`burbuja ${m.rol}`}>
                {m.texto}
              </div>
            ))}
            {cargando && <div className="burbuja asistente">Escribiendo...</div>}
          </div>
          <form className="chat-form" onSubmit={enviar}>
            <input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Ej: ¿Cuánto sale una limpieza?"
              disabled={cargando}
            />
            <button type="submit" disabled={cargando}>
              Enviar
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        className="chat-toggle"
        onClick={() => setAbierto((v) => !v)}
      >
        {abierto ? 'Cerrar' : 'Asistente'}
      </button>
    </div>
  );
}
