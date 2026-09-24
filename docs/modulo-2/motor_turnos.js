// =========================================================================
// PROYECTO INTEGRADOR - MÓDULO 2: MOTOR DE DATOS Y DECISIONES DE TURNOS
// Emprendimiento: OdontoTurno — Consultorio Odontológico
// =========================================================================

const NOMBRE_NEGOCIO = 'OdontoTurno';
const IVA_PORCENTAJE = 0.21;
const CUPON_VALIDO = 'PROMO20';

let nombreCliente = 'Mariano López';
let servicioSeleccionado = 'Limpieza profesional';
let precioBaseServicio = 22000;
let cuposDisponiblesDia = 3;
let esClienteVIP = true;
let codigoCuponIngresado = 'PROMO20';
let agendaBloqueada = false;

console.log(`=== ${NOMBRE_NEGOCIO} — Motor de decisión ===`);
console.log(`Cliente: ${nombreCliente}`);
console.log(`Servicio: ${servicioSeleccionado}`);

// Regla 1: Autorización de reserva
if (cuposDisponiblesDia > 0 && agendaBloqueada === false) {
  cuposDisponiblesDia = cuposDisponiblesDia - 1;
  console.log('Reserva AUTORIZADA. Cupos restantes:', cuposDisponiblesDia);

  // Regla 2: Descuentos
  let descuento = 0;
  if (esClienteVIP === true || codigoCuponIngresado === CUPON_VALIDO) {
    descuento = precioBaseServicio * 0.2;
    console.log('Descuento del 20% aplicado.');
  }

  const precioFinal = precioBaseServicio - descuento;
  const precioConIva = precioFinal * (1 + IVA_PORCENTAJE);

  console.log(`Precio base: $${precioBaseServicio}`);
  console.log(`Descuento: $${descuento}`);
  console.log(`Precio final: $${precioFinal}`);
  console.log(`Precio con IVA: $${precioConIva.toFixed(2)}`);
} else {
  console.log('Reserva RECHAZADA por falta de disponibilidad o agenda bloqueada.');
}

// Escenario alternativo (sin cupo)
console.log('\n--- Escenario sin cupo ---');
cuposDisponiblesDia = 0;
if (cuposDisponiblesDia > 0 && !agendaBloqueada) {
  console.log('Autorizada');
} else {
  console.log('Rechazada: sin cupos disponibles.');
}
