const ServicioModel = require('../models/servicioModel');

/**
 * Asistente virtual con respuestas contextuales (simulación educativa).
 * Inyecta el catálogo real de SQLite en el system prompt para evitar alucinaciones.
 */
function construirSystemPrompt(servicios) {
  const lista = servicios
    .map((s) => `- ${s.nombre}: $${s.precio} (${s.duracionMinutos} min)`)
    .join('\n');

  return `
Sos el asistente virtual de OdontoTurno, un consultorio odontológico.
Respondé en español, de forma breve y amable.
Horario de atención: lunes a viernes de 09:00 a 12:00 y de 16:00 a 19:00.
Cupón vigente: PROMO20 (20% de descuento). Clientes VIP también tienen 20% off.

Servicios disponibles en la base de datos:
${lista}

Si no sabés algo, invitá a contactar recepción.
`.trim();
}

function generarRespuesta(mensaje, servicios) {
  const texto = String(mensaje || '').toLowerCase();
  const lista = servicios
    .map((s) => `• ${s.nombre}: $${s.precio.toLocaleString('es-AR')} (${s.duracionMinutos} min)`)
    .join('\n');

  if (/precio|costo|cuánto|cuanto|valor/.test(texto)) {
    return `Estos son nuestros precios actuales:\n${lista}\n\nCon cupón PROMO20 o siendo VIP tenés 20% de descuento.`;
  }

  if (/horario|abre|atienden|cuando/.test(texto)) {
    return 'Atendemos de lunes a viernes de 09:00 a 12:00 y de 16:00 a 19:00. Podés reservar online desde el formulario de turnos.';
  }

  if (/limpieza|blanque|ortodon|consulta|servicio/.test(texto)) {
    return `Estos son los tratamientos disponibles:\n${lista}\n\n¿Querés que te ayude a elegir según tu necesidad?`;
  }

  if (/descuento|cupon|cupón|promo|vip/.test(texto)) {
    return 'Podés usar el cupón PROMO20 o marcar que sos cliente VIP para obtener un 20% de descuento sobre el precio base del tratamiento.';
  }

  return `¡Hola! Soy el asistente de OdontoTurno. Sobre tu consulta ("${mensaje}"):\n\nNuestros servicios activos son:\n${lista}\n\nTambién puedo ayudarte con precios, horarios o descuentos.`;
}

async function responderConsulta(mensaje) {
  const servicios = ServicioModel.obtenerActivos();
  const systemPrompt = construirSystemPrompt(servicios);
  const respuesta = generarRespuesta(mensaje, servicios);

  return {
    systemPromptUsado: systemPrompt.slice(0, 120) + '...',
    respuesta,
    fuenteDatos: 'sqlite:servicios',
  };
}

module.exports = { responderConsulta, construirSystemPrompt, generarRespuesta };
