require('dotenv').config();

async function enviarConfirmacionExterna(datosTurno) {
  const apiUrl = process.env.NOTIFICACIONES_API_URL;
  const apiKey = process.env.NOTIFICACIONES_API_KEY;

  if (!apiUrl) {
    return { exito: false, error: 'NOTIFICACIONES_API_URL no configurada' };
  }

  try {
    const respuesta = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey || ''}`,
      },
      body: JSON.stringify({
        title: `Confirmación de Turno #${datosTurno.id}`,
        body: `Hola ${datosTurno.cliente}, tu turno de ${datosTurno.servicio} el ${datosTurno.fecha} a las ${datosTurno.hora || ''} fue confirmado en OdontoTurno.`,
        userId: Number(datosTurno.id) || 1,
      }),
    });

    if (!respuesta.ok) {
      throw new Error(`Error en servicio externo: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    return { exito: true, referenciaExterna: resultado.id };
  } catch (error) {
    console.error('Fallo el envío de notificación externa:', error.message);
    return { exito: false, error: error.message };
  }
}

module.exports = { enviarConfirmacionExterna };
