const db = require('../config/database');

const SELECT_ENRIQUECIDO = `
  SELECT
    t.id,
    t.fecha,
    t.hora,
    t.estado,
    t.precio_base AS precioBase,
    t.descuento,
    t.precio_final AS precioFinal,
    t.codigo_cupon AS codigoCupon,
    t.creado_en AS creadoEn,
    u.nombre AS cliente,
    u.email,
    u.telefono,
    u.es_vip AS esVip,
    s.nombre AS servicio,
    s.codigo AS servicioCodigo,
    s.duracion_minutos AS duracionMinutos
  FROM turnos t
  INNER JOIN usuarios u ON u.id = t.usuario_id
  INNER JOIN servicios s ON s.id = t.servicio_id
`;

const TurnoModel = {
  obtenerTodos() {
    return db.prepare(`${SELECT_ENRIQUECIDO} ORDER BY t.fecha DESC, t.hora DESC`).all();
  },

  obtenerPorId(id) {
    return db.prepare(`${SELECT_ENRIQUECIDO} WHERE t.id = ?`).get(id);
  },

  existeCupo(fecha, hora, excluirId = null) {
    const row = excluirId
      ? db
          .prepare(
            `SELECT COUNT(*) AS c FROM turnos
             WHERE fecha = ? AND hora = ? AND id != ?
               AND estado IN ('CONFIRMADO', 'PENDIENTE')`
          )
          .get(fecha, hora, excluirId)
      : db
          .prepare(
            `SELECT COUNT(*) AS c FROM turnos
             WHERE fecha = ? AND hora = ? AND estado IN ('CONFIRMADO', 'PENDIENTE')`
          )
          .get(fecha, hora);
    return row.c === 0;
  },

  crear({
    fecha,
    hora,
    usuarioId,
    servicioId,
    precioBase,
    descuento,
    precioFinal,
    codigoCupon,
    estado = 'CONFIRMADO',
  }) {
    const result = db
      .prepare(
        `INSERT INTO turnos
          (fecha, hora, estado, precio_base, descuento, precio_final, codigo_cupon, usuario_id, servicio_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        fecha,
        hora,
        estado,
        precioBase,
        descuento,
        precioFinal,
        codigoCupon || null,
        usuarioId,
        servicioId
      );
    return result.lastInsertRowid;
  },

  actualizarEstado(id, estado) {
    return db.prepare('UPDATE turnos SET estado = ? WHERE id = ?').run(estado, id);
  },

  actualizarFechaHora(id, fecha, hora) {
    return db
      .prepare('UPDATE turnos SET fecha = ?, hora = ? WHERE id = ?')
      .run(fecha, hora, id);
  },

  eliminar(id) {
    return db.prepare('DELETE FROM turnos WHERE id = ?').run(id);
  },

  obtenerPendientesExpirados(ahoraIsoFecha, ahoraHora) {
    return db
      .prepare(
        `SELECT * FROM turnos
         WHERE estado = 'PENDIENTE'
           AND (fecha < ? OR (fecha = ? AND hora < ?))`
      )
      .all(ahoraIsoFecha, ahoraIsoFecha, ahoraHora);
  },
};

module.exports = TurnoModel;
