const { describe, it } = require('node:test');
const assert = require('node:assert');
const { validarCamposTurno, calcularTarifa } = require('../src/utils/validador');

describe('Validador de turnos', () => {
  it('rechaza turno incompleto', () => {
    const resultado = validarCamposTurno({
      cliente: 'Lucas',
      email: '',
      servicio: '',
      fecha: '2026-10-01',
      hora: '10:00',
    });
    assert.strictEqual(resultado.valido, false);
    assert.ok(resultado.errores.length >= 2);
  });

  it('acepta turno completo con email válido', () => {
    const resultado = validarCamposTurno({
      cliente: 'Lucas Pérez',
      email: 'lucas@mail.com',
      servicio: 'limpieza',
      fecha: '2026-10-01',
      hora: '10:00',
    });
    assert.strictEqual(resultado.valido, true);
  });

  it('aplica 20% con cupón PROMO20', () => {
    const tarifa = calcularTarifa(10000, { codigoCupon: 'PROMO20' });
    assert.strictEqual(tarifa.descuento, 2000);
    assert.strictEqual(tarifa.precioFinal, 8000);
    assert.strictEqual(tarifa.aplicaDescuento, true);
  });

  it('aplica 20% para cliente VIP sin cupón', () => {
    const tarifa = calcularTarifa(20000, { esClienteVIP: true });
    assert.strictEqual(tarifa.precioFinal, 16000);
  });

  it('no aplica descuento sin cupón ni VIP', () => {
    const tarifa = calcularTarifa(15000, {});
    assert.strictEqual(tarifa.descuento, 0);
    assert.strictEqual(tarifa.precioFinal, 15000);
  });
});
