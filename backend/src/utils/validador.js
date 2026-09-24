const CUPON_VALIDO = 'PROMO20';
const DESCUENTO = 0.2;

/**
 * Valida campos obligatorios de una solicitud de turno.
 * @param {object} datos
 * @returns {{ valido: boolean, errores: string[] }}
 */
function validarCamposTurno(datos) {
  const errores = [];
  const requeridos = ['cliente', 'email', 'servicio', 'fecha', 'hora'];

  for (const campo of requeridos) {
    if (!datos[campo] || String(datos[campo]).trim() === '') {
      errores.push(`El campo "${campo}" es obligatorio.`);
    }
  }

  if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    errores.push('El email no tiene un formato válido.');
  }

  return { valido: errores.length === 0, errores };
}

/**
 * Calcula descuento VIP o cupón PROMO20.
 */
function calcularTarifa(precioBase, { codigoCupon = '', esClienteVIP = false } = {}) {
  const cupon = String(codigoCupon || '').trim().toUpperCase();
  const aplicaDescuento = cupon === CUPON_VALIDO || Boolean(esClienteVIP);
  const descuento = aplicaDescuento ? precioBase * DESCUENTO : 0;
  return {
    precioBase,
    descuento,
    precioFinal: precioBase - descuento,
    aplicaDescuento,
  };
}

module.exports = {
  validarCamposTurno,
  calcularTarifa,
  CUPON_VALIDO,
  DESCUENTO,
};
