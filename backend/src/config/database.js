const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'data', 'odontoturno.db');
const fs = require('fs');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    es_vip INTEGER DEFAULT 0,
    creado_en TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS administradores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    activo INTEGER DEFAULT 1,
    creado_en TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    duracion_minutos INTEGER NOT NULL,
    precio REAL NOT NULL,
    mostrar_precio INTEGER DEFAULT 1,
    activo INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS turnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    estado TEXT DEFAULT 'CONFIRMADO',
    precio_base REAL NOT NULL,
    descuento REAL DEFAULT 0,
    precio_final REAL NOT NULL,
    codigo_cupon TEXT,
    usuario_id INTEGER NOT NULL,
    servicio_id INTEGER NOT NULL,
    creado_en TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
  );
`);

// Migración liviana: agregar mostrar_precio si la DB ya existía
const columnasServicios = db.prepare('PRAGMA table_info(servicios)').all();
if (!columnasServicios.some((c) => c.name === 'mostrar_precio')) {
  db.exec('ALTER TABLE servicios ADD COLUMN mostrar_precio INTEGER DEFAULT 1');
}

// Seed administrador por defecto (credenciales educativas)
const countAdmins = db.prepare('SELECT COUNT(*) AS c FROM administradores').get().c;
if (countAdmins === 0) {
  const bcrypt = require('bcryptjs');
  const email = (process.env.ADMIN_EMAIL || 'admin@odontoturno.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador OdontoTurno';
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(
    'INSERT INTO administradores (nombre, email, password_hash) VALUES (?, ?, ?)'
  ).run(nombre, email, passwordHash);

  console.log(`[SEED] Admin creado: ${email} / ${password}`);
}

const countServicios = db.prepare('SELECT COUNT(*) AS c FROM servicios').get().c;
if (countServicios === 0) {
  const insertServicio = db.prepare(`
    INSERT INTO servicios (codigo, nombre, descripcion, duracion_minutos, precio)
    VALUES (@codigo, @nombre, @descripcion, @duracion_minutos, @precio)
  `);

  const seedServicios = [
    {
      codigo: 'consulta',
      nombre: 'Consulta y diagnóstico',
      descripcion: 'Evaluación clínica completa con plan de tratamiento.',
      duracion_minutos: 30,
      precio: 15000,
    },
    {
      codigo: 'limpieza',
      nombre: 'Limpieza profesional',
      descripcion: 'Profilaxis dental con ultrasonido y pulido.',
      duracion_minutos: 45,
      precio: 22000,
    },
    {
      codigo: 'blanqueamiento',
      nombre: 'Blanqueamiento dental',
      descripcion: 'Tratamiento estético en consultorio.',
      duracion_minutos: 60,
      precio: 45000,
    },
    {
      codigo: 'ortodoncia',
      nombre: 'Control de ortodoncia',
      descripcion: 'Seguimiento de brackets o alineadores.',
      duracion_minutos: 30,
      precio: 18000,
    },
  ];

  const tx = db.transaction((items) => {
    for (const item of items) insertServicio.run(item);
  });
  tx(seedServicios);
}

const countUsuarios = db.prepare('SELECT COUNT(*) AS c FROM usuarios').get().c;
if (countUsuarios === 0) {
  db.prepare(
    'INSERT INTO usuarios (nombre, email, telefono, es_vip) VALUES (?, ?, ?, ?)'
  ).run('Cliente Demo', 'cliente@odontoturno.com', '1122334455', 0);

  db.prepare(
    'INSERT INTO usuarios (nombre, email, telefono, es_vip) VALUES (?, ?, ?, ?)'
  ).run('Paciente VIP', 'vip@odontoturno.com', '1199887766', 1);
}

module.exports = db;
