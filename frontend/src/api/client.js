const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const TOKEN_KEY = 'odontoturno_admin_token';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Error en la solicitud');
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request('/auth/me'),

  getTurnos: () => request('/turnos'),
  crearTurno: (body) =>
    request('/turnos', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  actualizarTurno: (id, body) =>
    request(`/turnos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  cancelarTurno: (id) =>
    request(`/turnos/${id}`, {
      method: 'DELETE',
    }),
  confirmarTurno: (id) =>
    request(`/turnos/${id}/confirmar`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  getServiciosPublicos: () => request('/servicios'),
  getServiciosAdmin: () => request('/admin/servicios'),
  crearServicio: (body) =>
    request('/admin/servicios', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  actualizarServicio: (id, body) =>
    request(`/admin/servicios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  eliminarServicio: (id) =>
    request(`/admin/servicios/${id}`, {
      method: 'DELETE',
    }),
};
