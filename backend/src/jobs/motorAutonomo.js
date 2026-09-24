const cron = require('node-cron');
const TurnoModel = require('../models/turnoModel');
const ServicioModel = require('../models/servicioModel');

function fechaHoraLocal() {
  const ahora = new Date();
  const fecha = ahora.toISOString().slice(0, 10);
  const hora = ahora.toTimeString().slice(0, 5);
  return { fecha, hora };
}

/**
 * Auditoría: turnos PENDIENTE cuyo horario ya venció → CANCELADO_POR_EXPIRACION
 */
function auditarTurnosExpirados() {
  try {
    const { fecha, hora } = fechaHoraLocal();
    const vencidos = TurnoModel.obtenerPendientesExpirados(fecha, hora);

    for (const turno of vencidos) {
      TurnoModel.actualizarEstado(turno.id, 'CANCELADO_POR_EXPIRACION');
      console.log(
        `[CRON] Turno #${turno.id} (${turno.fecha} ${turno.hora}) → CANCELADO_POR_EXPIRACION`
      );
    }

    if (vencidos.length === 0) {
      console.log(`[CRON] Auditoría OK — sin turnos pendientes expirados (${fecha} ${hora})`);
    }
  } catch (error) {
    console.error('[CRON] Error en auditoría de turnos:', error.message);
  }
}

/**
 * Actualizador de tarifas (simulación educativa de extractor externo).
 * Ajusta el precio de limpieza con una variación leve de mercado.
 */
async function actualizarTarifasMercado() {
  try {
    const limpieza = ServicioModel.buscarPorCodigo('limpieza');
    if (!limpieza) return;

    // Simulación de cotización externa (±3%)
    const factor = 1 + (Math.random() * 0.06 - 0.03);
    const nuevoPrecio = Math.round(limpieza.precio * factor);
    ServicioModel.actualizarPrecio('limpieza', nuevoPrecio);
    console.log(
      `[CRON] Tarifa limpieza actualizada: $${limpieza.precio} → $${nuevoPrecio}`
    );
  } catch (error) {
    console.error('[CRON] Error al actualizar tarifas:', error.message);
  }
}

function iniciarMotorAutonomo() {
  const expresion = process.env.CRON_EXPIRACION || '*/30 * * * *';
  const timezone = process.env.TZ || 'America/Argentina/Buenos_Aires';

  if (!cron.validate(expresion)) {
    console.warn(`[CRON] Expresión inválida "${expresion}". Motor no iniciado.`);
    return;
  }

  cron.schedule(
    expresion,
    () => {
      auditarTurnosExpirados();
      actualizarTarifasMercado();
    },
    { timezone }
  );

  console.log(`[CRON] Motor autónomo activo (${expresion}) TZ=${timezone}`);
}

module.exports = {
  iniciarMotorAutonomo,
  auditarTurnosExpirados,
  actualizarTarifasMercado,
};
