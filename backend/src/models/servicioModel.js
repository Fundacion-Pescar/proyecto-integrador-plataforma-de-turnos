const db = require('../config/database');

function mapServicio(row) {
  if (!row) return null;
  return {
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    descripcion: row.descripcion,
    duracionMinutos: row.duracion_minutos,
    precio: row.precio,
    mostrarPrecio: row.mostrar_precio === null || row.mostrar_precio === undefined
      ? true
      : Boolean(row.mostrar_precio),
    activo: Boolean(row.activo),
  };
}

const SELECT_COLS =
  'id, codigo, nombre, descripcion, duracion_minutos, precio, mostrar_precio, activo';

const ServicioModel = {
  obtenerActivos() {
    return db
      .prepare(
        `SELECT ${SELECT_COLS}
         FROM servicios WHERE activo = 1 ORDER BY nombre ASC`
      )
      .all()
      .map(mapServicio);
  },

  obtenerTodos() {
    return db
      .prepare(
        `SELECT ${SELECT_COLS}
         FROM servicios ORDER BY activo DESC, nombre ASC`
      )
      .all()
      .map(mapServicio);
  },

  buscarPorCodigo(codigo) {
    return db.prepare('SELECT * FROM servicios WHERE codigo = ?').get(codigo);
  },

  buscarPorId(id) {
    return db.prepare('SELECT * FROM servicios WHERE id = ?').get(id);
  },

  crear({ codigo, nombre, descripcion, duracionMinutos, precio, mostrarPrecio = true }) {
    const result = db
      .prepare(
        `INSERT INTO servicios (codigo, nombre, descripcion, duracion_minutos, precio, mostrar_precio, activo)
         VALUES (?, ?, ?, ?, ?, ?, 1)`
      )
      .run(
        String(codigo).trim().toLowerCase(),
        nombre.trim(),
        descripcion || null,
        Number(duracionMinutos),
        Number(precio),
        mostrarPrecio ? 1 : 0
      );
    return result.lastInsertRowid;
  },

  actualizar(id, { nombre, descripcion, duracionMinutos, precio, mostrarPrecio, activo }) {
    return db
      .prepare(
        `UPDATE servicios
         SET nombre = ?, descripcion = ?, duracion_minutos = ?, precio = ?, mostrar_precio = ?, activo = ?
         WHERE id = ?`
      )
      .run(
        nombre.trim(),
        descripcion || null,
        Number(duracionMinutos),
        Number(precio),
        mostrarPrecio ? 1 : 0,
        activo ? 1 : 0,
        id
      );
  },

  desactivar(id) {
    return db.prepare('UPDATE servicios SET activo = 0 WHERE id = ?').run(id);
  },

  actualizarPrecio(codigo, nuevoPrecio) {
    return db
      .prepare('UPDATE servicios SET precio = ? WHERE codigo = ?')
      .run(nuevoPrecio, codigo);
  },
};

module.exports = ServicioModel;
