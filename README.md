# OdontoTurno

![Node](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-0f766e)

Plataforma full stack de **gestión de turnos para un consultorio odontológico**. Proyecto Integrador de referencia (Fundación Pescar) listo para compartir con alumnos como repositorio completo.

## ¿Qué problema resuelve?

Los consultorios suelen agendar por WhatsApp o papel: dobles reservas, demoras y pacientes sin confirmación. **OdontoTurno** permite reservar online, validar cupos, aplicar descuentos y consultar un asistente virtual.

## Arquitectura

```text
proyecto-integrador-plataforma-de-turnos/
├── mvp/                 # Módulo 5 — HTML + CSS + JS (localStorage)
├── backend/             # Módulos 6–12 / 14 — Express MVC + SQLite
├── frontend/            # Backoffice React (login obligatorio)
├── landing/             # Landing comercial pública + reserva vía API
├── docs/                # Ficha de negocio y motor JS (Mód. 1–2)
├── PRODUCTO.md          # Pitch comercial (Mód. 13)
├── OFERTA_COMERCIAL.md  # Oferta y precios (Mód. 16)
└── README.md
```

```text
[ React / MVP ]  --HTTP JSON-->  [ Express API ]  --SQL-->  [ SQLite ]
                                      |
                               notificaciones externas
                               cron jobs + asistente IA
```

## Stack

| Capa | Tecnología |
|---|---|
| MVP | HTML5, CSS3 Flexbox, JavaScript Vanilla |
| Backend | Node.js, Express, better-sqlite3, dotenv, node-cron |
| Frontend | React 19, Vite |
| Docs API | Swagger UI en `/api-docs` |
| Tests | `node:test` + Supertest |

## Reglas de negocio

1. **Cupo:** no se puede reservar si ya hay un turno `CONFIRMADO` o `PENDIENTE` en la misma fecha y hora.
2. **Descuento 20%:** cupón `PROMO20` **o** cliente VIP.
3. **Cancelación:** soft delete (`estado = CANCELADO`).
4. **Cron:** turnos `PENDIENTE` vencidos → `CANCELADO_POR_EXPIRACION`.

## Catálogo de servicios

| Código | Servicio | Duración | Precio |
|---|---|---|---|
| `consulta` | Consulta y diagnóstico | 30 min | $15.000 |
| `limpieza` | Limpieza profesional | 45 min | $22.000 |
| `blanqueamiento` | Blanqueamiento dental | 60 min | $45.000 |
| `ortodoncia` | Control de ortodoncia | 30 min | $18.000 |

## Instalación local

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API: http://localhost:3000  
Swagger: http://localhost:3000/api-docs  
Health: http://localhost:3000/api/v1/health

### 2. Frontend React (backoffice)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:5173  
La primera pantalla es siempre el **login**. Sin sesión no se puede entrar a turnos ni servicios.  
Credenciales demo: `admin@odontoturno.com` / `admin123`

Pantallas protegidas:
- `/turnos` — listado, alta y gestión de turnos
- `/servicios` — alta/edición del catálogo de servicios

### 3. Landing comercial (Módulo 16)

Con el backend corriendo, abrí `landing/index.html` con Live Server (o `npx serve landing`).  
Permite sacar un turno real vía `POST /api/v1/turnos`.

### 4. MVP (sin servidor)

Abrí `mvp/index.html` en el navegador (o con Live Server). Guarda turnos en `localStorage`.

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/health` | Salud del servicio |
| GET | `/api/v1/servicios` | Catálogo |
| GET | `/api/v1/turnos` | Listado (requiere JWT admin) |
| POST | `/api/v1/turnos` | Crear reserva (público / backoffice) |
| PATCH | `/api/v1/turnos/:id` | Actualizar estado/fecha (admin) |
| DELETE | `/api/v1/turnos/:id` | Cancelar (admin) |
| POST | `/api/v1/auth/login` | Login administrador |
| GET | `/api/v1/admin/servicios` | Catálogo completo (admin) |
| POST | `/api/v1/admin/servicios` | Crear servicio (admin) |
| PATCH | `/api/v1/admin/servicios/:id` | Editar servicio (admin) |
| DELETE | `/api/v1/admin/servicios/:id` | Desactivar servicio (admin) |
| POST | `/api/v1/chat` | Asistente virtual |

También están disponibles bajo `/api/...` (sin `v1`) para compatibilidad con las consignas de los módulos intermedios.

### Ejemplo POST turno

```json
{
  "cliente": "Mariana Rossi",
  "email": "mariana@mail.com",
  "telefono": "1122334455",
  "servicio": "limpieza",
  "fecha": "2026-10-15",
  "hora": "10:00",
  "codigoCupon": "PROMO20",
  "esClienteVIP": false
}
```

## Tests

```bash
cd backend
npm test
```

Incluye pruebas unitarias del validador y pruebas de integración de la API con Supertest.

## Mapa por módulo del curso

| Módulo | Carpeta / artefacto |
|---|---|
| 1 | `docs/modulo-1/ficha-negocio.md` |
| 2 | `docs/modulo-2/motor_turnos.js` |
| 5 | `mvp/` |
| 6–8 | `backend/` (Express, SQLite, dotenv, notificaciones) |
| 9 | `backend/src/jobs/motorAutonomo.js` |
| 10–11 | `frontend/` + `POST /api/v1/chat` |
| 12 | MVC en `backend/src/` + `backend/test/` |
| 13 | `PRODUCTO.md` |
| 14 | README + `backend/tests/` + Swagger |

## Variables de entorno (backend)

Ver `backend/.env.example`:

- `PORT`
- `NOTIFICACIONES_API_URL` / `NOTIFICACIONES_API_KEY`
- `CRON_EXPIRACION`
- `TZ`

## Licencia

MIT — material educativo de referencia para el Proyecto Integrador.
