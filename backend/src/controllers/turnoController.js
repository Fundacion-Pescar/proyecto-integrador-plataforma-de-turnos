const TurnoModel = require('../models/turnoModel');
const UsuarioModel = require('../models/usuarioModel');
const ServicioModel = require('../models/servicioModel');
const { validarCamposTurno, calcularTarifa } = require('../utils/validador');
const { enviarConfirmacionExterna } = require('../services/notificacionService');

exports.obtenerTurnos = (req, res, next) => {
  try {
    const turnos = TurnoModel.obtenerTodos().map((t) => ({
      ...t,
      esVip: Boolean(t.esVip),
    }));
    res.status(200).json({
      exito: true,
      cantidad: turnos.length,
      data: turnos,
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerTurnoPorId = (req, res, next) => {
  try {
    const turno = TurnoModel.obtenerPorId(Number(req.params.id));
    if (!turno) {
      return res.status(404).json({
        exito: false,
        errorId: 404010,
        errorCode: 'TURNO_NOT_FOUND',
        message: 'No se encontró el turno solicitado.',
      });
    }
    res.json({ exito: true, data: { ...turno, esVip: Boolean(turno.esVip) } });
  } catch (error) {
    next(error);
  }
};

exports.crearTurno = async (req, res, next) => {
  try {
    const {
      cliente,
      email,
      telefono,
      servicio,
      fecha,
      hora,
      codigoCupon,
      esClienteVIP,
    } = req.body;

    const validacion = validarCamposTurno({ cliente, email, servicio, fecha, hora });
    if (!validacion.valido) {
      return res.status(400).json({
        exito: false,
        errorId: 400010,
        errorCode: 'VALIDATION_ERROR',
        message: 'Datos incompletos o inválidos.',
        errores: validacion.errores,
      });
    }

    const servicioDb = ServicioModel.buscarPorCodigo(servicio);
    if (!servicioDb || !servicioDb.activo) {
      return res.status(400).json({
        exito: false,
        errorId: 400011,
        errorCode: 'SERVICIO_INVALIDO',
        message: 'El servicio indicado no existe o está inactivo.',
      });
    }

    if (!TurnoModel.existeCupo(fecha, hora)) {
      return res.status(409).json({
        exito: false,
        errorId: 409010,
        errorCode: 'CUPO_NO_DISPONIBLE',
        message: 'Horario no disponible. Seleccioná otra fecha u hora.',
      });
    }

    const usuario = UsuarioModel.obtenerOCrear({
      nombre: cliente,
      email,
      telefono,
      esVip: Boolean(esClienteVIP),
    });

    const tarifa = calcularTarifa(servicioDb.precio, {
      codigoCupon,
      esClienteVIP: Boolean(esClienteVIP) || Boolean(usuario.es_vip),
    });

    const id = TurnoModel.crear({
      fecha,
      hora,
      usuarioId: usuario.id,
      servicioId: servicioDb.id,
      precioBase: tarifa.precioBase,
      descuento: tarifa.descuento,
      precioFinal: tarifa.precioFinal,
      codigoCupon,
      estado: 'CONFIRMADO',
    });

    const creado = TurnoModel.obtenerPorId(id);

    // Notificación externa (best-effort)
    const notificacion = await enviarConfirmacionExterna({
      id,
      cliente: creado.cliente,
      servicio: creado.servicio,
      fecha: creado.fecha,
      hora: creado.hora,
    });

    res.status(201).json({
      exito: true,
      mensaje: 'Turno reservado con éxito',
      data: { ...creado, esVip: Boolean(creado.esVip) },
      notificacionExterna: notificacion,
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelarTurno = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const turno = TurnoModel.obtenerPorId(id);

    if (!turno) {
      return res.status(404).json({
        exito: false,
        errorId: 404010,
        errorCode: 'TURNO_NOT_FOUND',
        message: 'No se encontró el turno solicitado para cancelar.',
      });
    }

    TurnoModel.actualizarEstado(id, 'CANCELADO');

    res.status(200).json({
      exito: true,
      mensaje: `Turno ID ${id} cancelado correctamente.`,
    });
  } catch (error) {
    next(error);
  }
};

const ESTADOS_VALIDOS = [
  'PENDIENTE',
  'CONFIRMADO',
  'COMPLETADO',
  'CANCELADO',
  'CANCELADO_POR_EXPIRACION',
];

exports.actualizarTurno = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const turno = TurnoModel.obtenerPorId(id);

    if (!turno) {
      return res.status(404).json({
        exito: false,
        errorId: 404010,
        errorCode: 'TURNO_NOT_FOUND',
        message: 'No se encontró el turno solicitado.',
      });
    }

    const { estado, fecha, hora } = req.body;

    if (estado) {
      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({
          exito: false,
          errorId: 400040,
          errorCode: 'ESTADO_INVALIDO',
          message: `Estado inválido. Usá uno de: ${ESTADOS_VALIDOS.join(', ')}`,
        });
      }
      TurnoModel.actualizarEstado(id, estado);
    }

    if (fecha || hora) {
      const nuevaFecha = fecha || turno.fecha;
      const nuevaHora = hora || turno.hora;

      if (nuevaFecha !== turno.fecha || nuevaHora !== turno.hora) {
        if (!TurnoModel.existeCupo(nuevaFecha, nuevaHora, id)) {
          return res.status(409).json({
            exito: false,
            errorId: 409010,
            errorCode: 'CUPO_NO_DISPONIBLE',
            message: 'El nuevo horario no está disponible.',
          });
        }
        TurnoModel.actualizarFechaHora(id, nuevaFecha, nuevaHora);
      }
    }

    const actualizado = TurnoModel.obtenerPorId(id);
    res.json({
      exito: true,
      mensaje: 'Turno actualizado correctamente.',
      data: { ...actualizado, esVip: Boolean(actualizado.esVip) },
    });
  } catch (error) {
    next(error);
  }
};

exports.confirmarTurno = async (req, res, next) => {
  try {
    const turnoId = Number(req.params.id);
    const turno = TurnoModel.obtenerPorId(turnoId);

    const cliente = req.body.cliente || turno?.cliente || 'Cliente General';
    const servicio = req.body.servicio || turno?.servicio || 'Servicio General';
    const fecha = req.body.fecha || turno?.fecha || new Date().toISOString().slice(0, 10);
    const hora = req.body.hora || turno?.hora || '';

    if (turno) {
      TurnoModel.actualizarEstado(turnoId, 'CONFIRMADO');
    }

    const resultadoNotificacion = await enviarConfirmacionExterna({
      id: turnoId,
      cliente,
      servicio,
      fecha,
      hora,
    });

    res.status(200).json({
      exito: true,
      mensaje: `Turno #${turnoId} confirmado exitosamente.`,
      notificacionExterna: resultadoNotificacion,
    });
  } catch (error) {
    next(error);
  }
};

exports.eliminarTurno = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = TurnoModel.eliminar(id);

    if (result.changes === 0) {
      return res.status(404).json({
        exito: false,
        errorId: 404010,
        errorCode: 'TURNO_NOT_FOUND',
        message: 'No se encontró el turno solicitado.',
      });
    }

    res.status(200).json({
      exito: true,
      mensaje: `Turno ID ${id} eliminado correctamente.`,
    });
  } catch (error) {
    next(error);
  }
};
