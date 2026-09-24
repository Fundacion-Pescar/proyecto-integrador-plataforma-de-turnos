const bcrypt = require('bcryptjs');
const db = require('../config/database');

const AdminModel = {
  buscarPorEmail(email) {
    return db
      .prepare(
        'SELECT id, nombre, email, password_hash AS passwordHash, activo FROM administradores WHERE email = ?'
      )
      .get(String(email || '').toLowerCase().trim());
  },

  buscarPorId(id) {
    return db
      .prepare(
        'SELECT id, nombre, email, activo FROM administradores WHERE id = ?'
      )
      .get(id);
  },

  crear({ nombre, email, password }) {
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db
      .prepare(
        'INSERT INTO administradores (nombre, email, password_hash) VALUES (?, ?, ?)'
      )
      .run(nombre, String(email).toLowerCase().trim(), passwordHash);
    return result.lastInsertRowid;
  },

  verificarPassword(passwordPlano, passwordHash) {
    return bcrypt.compareSync(passwordPlano, passwordHash);
  },
};

module.exports = AdminModel;
