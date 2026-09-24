# Engineering Standards (Frontend - React / Backoffice OdontoTurno)

SPA React con Vite. Es el **backoffice** del consultorio: login obligatorio.

## Stack
- React + Vite + React Router
- fetch vía `src/api/client.js` (JWT en sessionStorage)
- CSS propio

## Rutas
- `/` → Login (única pantalla pública)
- `/turnos` → protegida
- `/servicios` → protegida (catálogo de servicios)

## Reglas
- Sin sesión → siempre redirect a `/`
- Componentes no llaman `fetch` directo: usar `api`
- Las reservas públicas viven en `landing/` y `mvp/`, no en este frontend
