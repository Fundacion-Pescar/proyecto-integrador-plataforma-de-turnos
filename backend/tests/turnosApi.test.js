const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';

describe('API Turnos — integración', () => {
  let app;
  let adminToken;

  before(async () => {
    app = require('../src/app');

    const login = await request(app).post('/api/v1/auth/login').send({
      email: process.env.ADMIN_EMAIL || 'admin@odontoturno.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    });

    assert.strictEqual(login.status, 200);
    adminToken = login.body.data.token;
  });

  it('GET /api/v1/health responde ok', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.exito, true);
    assert.strictEqual(res.body.estado, 'ok');
  });

  it('POST /api/v1/auth/login autentica admin', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@odontoturno.com',
      password: 'admin123',
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.token);
  });

  it('GET /api/v1/servicios retorna catálogo', async () => {
    const res = await request(app).get('/api/v1/servicios');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.exito, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 1);
  });

  it('GET /api/v1/turnos sin token responde 401', async () => {
    const res = await request(app).get('/api/v1/turnos');
    assert.strictEqual(res.status, 401);
  });

  it('GET /api/v1/turnos con token retorna listado', async () => {
    const res = await request(app)
      .get('/api/v1/turnos')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.exito, true);
    assert.ok(Array.isArray(res.body.data));
  });

  it('POST /api/v1/turnos crea reserva pública (201)', async () => {
    const stamp = Date.now();
    const horas = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00'];
    const hora = horas[stamp % horas.length];
    const dia = 10 + (stamp % 18);
    const res = await request(app)
      .post('/api/v1/turnos')
      .send({
        cliente: 'Test Paciente',
        email: `test.${stamp}@odontoturno.com`,
        telefono: '1100000000',
        servicio: 'consulta',
        fecha: `2026-12-${String(dia).padStart(2, '0')}`,
        hora,
        codigoCupon: 'PROMO20',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.exito, true);
    assert.ok(res.body.data.id);
    assert.strictEqual(res.body.data.precioFinal, 12000);
  });

  it('POST /api/v1/turnos rechaza datos incompletos (400)', async () => {
    const res = await request(app).post('/api/v1/turnos').send({
      cliente: 'Sin datos',
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.exito, false);
  });

  it('POST /api/v1/chat responde con contexto de servicios', async () => {
    const res = await request(app)
      .post('/api/v1/chat')
      .send({ mensaje: '¿Cuáles son los precios?' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.exito, true);
    assert.ok(res.body.respuesta.includes('Limpieza') || res.body.respuesta.includes('Consulta'));
  });
});
