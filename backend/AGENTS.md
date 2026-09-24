# Engineering Standards (Backend - Express / Proyecto Integrador)

Este backend sigue el stack del curso (no NestJS): Express + SQLite + MVC.

## Stack
- Node.js (LTS)
- Express
- better-sqlite3
- dotenv
- node-cron
- swagger-ui-express
- Tests: node:test + supertest

## Arquitectura MVC
```
src/
  config/        # database, swagger
  models/        # acceso SQL
  controllers/   # req/res + reglas
  routes/        # endpoints
  services/      # integraciones / IA
  jobs/          # cron
  middlewares/
  utils/
```

## Reglas
- Controllers no escriben SQL directo.
- Models no conocen `req`/`res`.
- Credenciales solo en `.env` (nunca en git).
- Errores JSON con `exito`, `errorCode`, `message`.

## Scripts
- `npm run dev` — nodemon
- `npm test` — unitarias + integración
