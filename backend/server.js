require('dotenv').config();

const app = require('./src/app');
const { iniciarMotorAutonomo } = require('./src/jobs/motorAutonomo');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🦷 OdontoTurno API corriendo en http://localhost:${PORT}`);
  console.log(`📘 Docs Swagger: http://localhost:${PORT}/api-docs`);
  iniciarMotorAutonomo();
});
