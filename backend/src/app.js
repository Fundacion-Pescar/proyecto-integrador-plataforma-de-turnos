const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Inicializa DB y seeds al cargar la app
require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({
    exito: true,
    servicio: 'OdontoTurno API',
    entorno: process.env.ENTORNO || 'desarrollo',
    estado: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', apiRoutes);
// Alias sin versionado (compatible con consignas de módulos 6–8)
app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
