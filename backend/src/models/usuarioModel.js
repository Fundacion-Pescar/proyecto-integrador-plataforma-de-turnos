const db = require('../config/database');

const UsuarioModel = {
  buscarPorEmail(email) {
    return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  },

  crear({ nombre, email, telefono, esVip = false }) {
    const result = db
      .prepare(
        'INSERT INTO usuarios (nombre, email, telefono, es_vip) VALUES (?, ?, ?, ?)'
      )
      .run(nombre, email, telefono || null, esVip ? 1 : 0);
    return result.lastInsertRowid;
  },

  obtenerOCrear({ nombre, email, telefono, esVip = false }) {
    const existente = this.buscarPorEmail(email);
    if (existente) {
      if (esVip && !existente.es_vip) {
        db.prepare('UPDATE usuarios SET es_vip = 1 WHERE id = ?').run(existente.id);
        return { ...existente, es_vip: 1 };
      }
      return existente;
    }
    const id = this.crear({ nombre, email, telefono, esVip });
    return this.buscarPorEmail(email) || { id, nombre, email, telefono, es_vip: esVip ? 1 : 0 };
  },
};

module.exports = UsuarioModel;
