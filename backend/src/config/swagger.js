const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'OdontoTurno API',
    version: '1.0.0',
    description:
      'API REST del Proyecto Integrador — plataforma de gestión de turnos para consultorio odontológico.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local' }],
  paths: {
    '/api/v1/health': {
      get: {
        summary: 'Health check',
        responses: { 200: { description: 'Servicio operativo' } },
      },
    },
    '/api/v1/servicios': {
      get: {
        summary: 'Listar servicios odontológicos',
        responses: { 200: { description: 'Catálogo de servicios' } },
      },
    },
    '/api/v1/turnos': {
      get: {
        summary: 'Listar turnos',
        responses: { 200: { description: 'Listado enriquecido con JOIN' } },
      },
      post: {
        summary: 'Crear turno',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cliente', 'email', 'servicio', 'fecha', 'hora'],
                properties: {
                  cliente: { type: 'string', example: 'Mariana Rossi' },
                  email: { type: 'string', example: 'mariana@mail.com' },
                  telefono: { type: 'string', example: '1122334455' },
                  servicio: { type: 'string', example: 'limpieza' },
                  fecha: { type: 'string', example: '2026-10-15' },
                  hora: { type: 'string', example: '10:00' },
                  codigoCupon: { type: 'string', example: 'PROMO20' },
                  esClienteVIP: { type: 'boolean', example: false },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Turno creado' },
          400: { description: 'Validación fallida' },
          409: { description: 'Cupo no disponible' },
        },
      },
    },
    '/api/v1/turnos/{id}': {
      delete: {
        summary: 'Cancelar turno (soft delete por estado)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Cancelado' }, 404: { description: 'No encontrado' } },
      },
    },
    '/api/v1/turnos/{id}/confirmar': {
      post: {
        summary: 'Confirmar turno y notificar API externa',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Confirmado' } },
      },
    },
    '/api/v1/chat': {
      post: {
        summary: 'Asistente virtual contextual',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { mensaje: { type: 'string', example: '¿Cuánto sale una limpieza?' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Respuesta del asistente' } },
      },
    },
  },
};

module.exports = swaggerSpec;
