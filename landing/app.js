/**
 * Landing comercial OdontoTurno (Módulo 16)
 * HTML + CSS + JS Vanilla → API Express
 */

const API_URL = window.ODONTOTURNO_API_URL || 'http://localhost:3000/api/v1';

const form = document.querySelector('#formTurno');
const selectServicio = document.querySelector('#servicio');
const inputFecha = document.querySelector('#fecha');
const btnSubmit = document.querySelector('#btnSubmit');
const mensajeOk = document.querySelector('#mensajeOk');
const mensajeError = document.querySelector('#mensajeError');
const apiHint = document.querySelector('#apiHint');

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
}

function etiquetaServicio(servicio) {
  if (servicio.mostrarPrecio === false) {
    return servicio.nombre;
  }
  return `${servicio.nombre} — ${formatearPrecio(servicio.precio)}`;
}

function mostrarOk(html) {
  mensajeError.hidden = true;
  mensajeOk.hidden = false;
  mensajeOk.innerHTML = html;
}

function mostrarError(texto) {
  mensajeOk.hidden = true;
  mensajeError.hidden = false;
  mensajeError.textContent = texto;
}

function configurarFechaMinima() {
  inputFecha.min = new Date().toISOString().slice(0, 10);
}

async function cargarServicios() {
  try {
    const res = await fetch(`${API_URL}/servicios`);
    const data = await res.json();

    if (!res.ok || !data.exito) {
      throw new Error(data.message || 'No se pudieron cargar los servicios');
    }

    selectServicio.innerHTML =
      '<option value="">-- Seleccioná un servicio --</option>' +
      data.data
        .map((s) => `<option value="${s.codigo}">${etiquetaServicio(s)}</option>`)
        .join('');

    if (apiHint) {
      apiHint.hidden = true;
    }
  } catch (error) {
    selectServicio.innerHTML =
      '<option value="">No se pudo cargar el catálogo</option>';
    if (apiHint) {
      apiHint.hidden = false;
      apiHint.innerHTML =
        'Para probar la demo local, levantá la API con <code>cd backend && npm run dev</code>.';
    }
    mostrarError('No pudimos conectar con la agenda. Intentá de nuevo en un momento.');
  }
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const payload = {
    cliente: document.querySelector('#cliente').value.trim(),
    email: document.querySelector('#email').value.trim(),
    telefono: document.querySelector('#telefono').value.trim(),
    servicio: document.querySelector('#servicio').value,
    fecha: document.querySelector('#fecha').value,
    hora: document.querySelector('#hora').value,
    codigoCupon: document.querySelector('#codigoCupon').value.trim(),
    esClienteVIP: document.querySelector('#esClienteVIP').checked,
  };

  if (
    !payload.cliente ||
    !payload.email ||
    !payload.telefono ||
    !payload.servicio ||
    !payload.fecha ||
    !payload.hora
  ) {
    mostrarError('Completá todos los campos obligatorios.');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Confirmando...';

  try {
    const res = await fetch(`${API_URL}/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.exito) {
      throw new Error(data.message || 'No se pudo crear el turno');
    }

    const turno = data.data;
    const total =
      turno.mostrarPrecio === false
        ? 'A confirmar en recepción'
        : formatearPrecio(turno.precioFinal);

    mostrarOk(`
      <strong>¡Turno demo confirmado!</strong><br />
      Paciente: ${turno.cliente}<br />
      Servicio: ${turno.servicio}<br />
      Fecha: ${turno.fecha} a las ${turno.hora} hs<br />
      Total: <strong>${total}</strong>
    `);
    form.reset();
    configurarFechaMinima();
  } catch (error) {
    mostrarError(error.message);
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Confirmar turno demo';
  }
});

configurarFechaMinima();
cargarServicios();
