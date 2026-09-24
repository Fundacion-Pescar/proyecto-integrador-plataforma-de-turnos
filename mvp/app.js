/**
 * OdontoTurno — MVP Módulo 5
 * HTML + CSS + JavaScript Vanilla (localStorage)
 */

const STORAGE_KEY = 'odontoturno_turnos';
const CUPON_VALIDO = 'PROMO20';
const DESCUENTO_PORCENTAJE = 0.2;

const SERVICIOS = [
  {
    id: 'consulta',
    nombre: 'Consulta y diagnóstico',
    descripcion: 'Evaluación clínica completa con plan de tratamiento personalizado.',
    duracionMinutos: 30,
    precio: 15000,
    badge: 'Esencial',
  },
  {
    id: 'limpieza',
    nombre: 'Limpieza profesional',
    descripcion: 'Profilaxis dental con ultrasonido y pulido para una sonrisa saludable.',
    duracionMinutos: 45,
    precio: 22000,
    badge: 'Popular',
  },
  {
    id: 'blanqueamiento',
    nombre: 'Blanqueamiento dental',
    descripcion: 'Tratamiento estético en consultorio con resultados visibles en una sesión.',
    duracionMinutos: 60,
    precio: 45000,
    badge: 'Estética',
  },
  {
    id: 'ortodoncia',
    nombre: 'Control de ortodoncia',
    descripcion: 'Seguimiento de brackets o alineadores con ajustes según evolución.',
    duracionMinutos: 30,
    precio: 18000,
    badge: 'Seguimiento',
  },
];

const form = document.querySelector('#formTurno');
const selectServicio = document.querySelector('#servicio');
const grillaServicios = document.querySelector('#grillaServicios');
const listaTurnos = document.querySelector('#listaTurnos');
const mensajeConfirmacion = document.querySelector('#mensajeConfirmacion');
const mensajeError = document.querySelector('#mensajeError');
const inputFecha = document.querySelector('#fecha');

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
}

function obtenerTurnos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function guardarTurnos(turnos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
}

function renderServicios() {
  grillaServicios.innerHTML = SERVICIOS.map(
    (s) => `
    <article class="tarjeta-servicio">
      <span class="badge">${s.badge}</span>
      <h3>${s.nombre}</h3>
      <p class="descripcion">${s.descripcion}</p>
      <p class="duracion">Duración: ${s.duracionMinutos} min</p>
      <p class="precio">${formatearPrecio(s.precio)}</p>
    </article>
  `
  ).join('');

  selectServicio.innerHTML =
    '<option value="">-- Seleccioná un servicio --</option>' +
    SERVICIOS.map((s) => `<option value="${s.id}">${s.nombre}</option>`).join('');
}

function renderListaTurnos() {
  const turnos = obtenerTurnos().filter((t) => t.estado !== 'CANCELADO');

  if (turnos.length === 0) {
    listaTurnos.innerHTML = '<li class="vacio">Todavía no hay turnos reservados.</li>';
    return;
  }

  listaTurnos.innerHTML = turnos
    .map((t) => {
      const servicio = SERVICIOS.find((s) => s.id === t.servicioId);
      return `
      <li class="item-turno" data-id="${t.id}">
        <div>
          <strong>${t.nombreCliente}</strong>
          <p class="meta">${servicio ? servicio.nombre : t.servicioId} · ${t.fecha} ${t.hora} hs</p>
          <p class="meta">Total: ${formatearPrecio(t.precioFinal)} · ${t.estado}</p>
        </div>
        <button type="button" class="btn-cancelar" data-cancel="${t.id}">Cancelar</button>
      </li>
    `;
    })
    .join('');
}

function hayCupoDisponible(fecha, hora) {
  const turnos = obtenerTurnos();
  const ocupado = turnos.some(
    (t) => t.fecha === fecha && t.hora === hora && t.estado === 'CONFIRMADO'
  );
  return !ocupado;
}

function calcularPrecio(servicioId, codigoCupon, esClienteVIP) {
  const servicio = SERVICIOS.find((s) => s.id === servicioId);
  if (!servicio) return null;

  const aplicaDescuento =
    codigoCupon.toUpperCase() === CUPON_VALIDO || esClienteVIP === true;

  const descuento = aplicaDescuento ? servicio.precio * DESCUENTO_PORCENTAJE : 0;
  const precioFinal = servicio.precio - descuento;

  return {
    precioBase: servicio.precio,
    descuento,
    precioFinal,
    aplicaDescuento,
    nombreServicio: servicio.nombre,
  };
}

function mostrarConfirmacion(html) {
  mensajeError.classList.add('oculta');
  mensajeConfirmacion.classList.remove('oculta');
  mensajeConfirmacion.innerHTML = html;
}

function mostrarError(texto) {
  mensajeConfirmacion.classList.add('oculta');
  mensajeError.classList.remove('oculta');
  mensajeError.textContent = texto;
}

function configurarFechaMinima() {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  inputFecha.min = `${yyyy}-${mm}-${dd}`;
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const nombreCliente = document.querySelector('#nombre').value.trim();
  const email = document.querySelector('#email').value.trim();
  const telefono = document.querySelector('#telefono').value.trim();
  const servicioId = document.querySelector('#servicio').value;
  const fecha = document.querySelector('#fecha').value;
  const hora = document.querySelector('#hora').value;
  const codigoCupon = document.querySelector('#codigoCupon').value.trim();
  const esClienteVIP = document.querySelector('#esClienteVIP').checked;

  if (!nombreCliente || !email || !telefono || !servicioId || !fecha || !hora) {
    mostrarError('Completá todos los campos obligatorios para continuar.');
    return;
  }

  if (!hayCupoDisponible(fecha, hora)) {
    mostrarError(
      `Horario no disponible. El ${fecha} a las ${hora} hs ya está reservado. Elegí otro horario.`
    );
    return;
  }

  const precios = calcularPrecio(servicioId, codigoCupon, esClienteVIP);
  if (!precios) {
    mostrarError('El servicio seleccionado no es válido.');
    return;
  }

  const nuevoTurno = {
    id: Date.now(),
    nombreCliente,
    email,
    telefono,
    servicioId,
    fecha,
    hora,
    precioBase: precios.precioBase,
    descuento: precios.descuento,
    precioFinal: precios.precioFinal,
    esClienteVIP,
    codigoCupon: codigoCupon || null,
    estado: 'CONFIRMADO',
    creadoEn: new Date().toISOString(),
  };

  const turnos = obtenerTurnos();
  turnos.push(nuevoTurno);
  guardarTurnos(turnos);

  const mensajeDescuento = precios.aplicaDescuento
    ? `<p>Se aplicó un 20% de descuento (−${formatearPrecio(precios.descuento)}).</p>`
    : '';

  mostrarConfirmacion(`
    <strong>¡Reserva confirmada!</strong>
    <p>Cliente: ${nombreCliente}</p>
    <p>Servicio: ${precios.nombreServicio}</p>
    <p>Fecha y hora: ${fecha} a las ${hora} hs</p>
    ${mensajeDescuento}
    <p>Total a pagar: <strong>${formatearPrecio(precios.precioFinal)}</strong></p>
  `);

  form.reset();
  renderListaTurnos();
});

listaTurnos.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-cancel]');
  if (!boton) return;

  const id = Number(boton.dataset.cancel);
  const turnos = obtenerTurnos().map((t) =>
    t.id === id ? { ...t, estado: 'CANCELADO' } : t
  );
  guardarTurnos(turnos);
  renderListaTurnos();
});

renderServicios();
configurarFechaMinima();
renderListaTurnos();
