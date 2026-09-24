const ServicioModel = require('../models/servicioModel');

function slugCodigo(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

exports.obtenerServicios = (req, res, next) => {
  try {
    const servicios = ServicioModel.obtenerActivos();
    res.json({
      exito: true,
      cantidad: servicios.length,
      data: servicios,
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerTodosAdmin = (req, res, next) => {
  try {
    const servicios = ServicioModel.obtenerTodos();
    res.json({
      exito: true,
      cantidad: servicios.length,
      data: servicios,
    });
  } catch (error) {
    next(error);
  }
};

exports.crearServicio = (req, res, next) => {
  try {
    const {
      codigo,
      nombre,
      descripcion,
      duracionMinutos,
      precio,
      mostrarPrecio = true,
    } = req.body;

    if (!nombre || !duracionMinutos || precio === undefined || precio === null) {
      return res.status(400).json({
        exito: false,
        errorId: 400050,
        errorCode: 'SERVICIO_VALIDATION',
        message: 'Nombre, duración y precio son obligatorios.',
      });
    }

    const codigoFinal = (codigo && String(codigo).trim()) || slugCodigo(nombre);
    if (!codigoFinal) {
      return res.status(400).json({
        exito: false,
        errorId: 400051,
        errorCode: 'SERVICIO_CODIGO_INVALIDO',
        message: 'No se pudo generar un código válido para el servicio.',
      });
    }

    if (ServicioModel.buscarPorCodigo(codigoFinal)) {
      return res.status(409).json({
        exito: false,
        errorId: 409050,
        errorCode: 'SERVICIO_DUPLICADO',
        message: 'Ya existe un servicio con ese código.',
      });
    }

    const id = ServicioModel.crear({
      codigo: codigoFinal,
      nombre,
      descripcion,
      duracionMinutos,
      precio,
      mostrarPrecio: Boolean(mostrarPrecio),
    });

    const creado = ServicioModel.obtenerTodos().find((s) => s.id === id);
    res.status(201).json({
      exito: true,
      mensaje: 'Servicio creado correctamente.',
      data: creado,
    });
  } catch (error) {
    next(error);
  }
};

exports.actualizarServicio = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existente = ServicioModel.buscarPorId(id);

    if (!existente) {
      return res.status(404).json({
        exito: false,
        errorId: 404050,
        errorCode: 'SERVICIO_NOT_FOUND',
        message: 'Servicio no encontrado.',
      });
    }

    const {
      nombre = existente.nombre,
      descripcion = existente.descripcion,
      duracionMinutos = existente.duracion_minutos,
      precio = existente.precio,
      mostrarPrecio = existente.mostrar_precio === null || existente.mostrar_precio === undefined
        ? true
        : Boolean(existente.mostrar_precio),
      activo = Boolean(existente.activo),
    } = req.body;

    if (!nombre || !duracionMinutos || precio === undefined) {
      return res.status(400).json({
        exito: false,
        errorId: 400050,
        errorCode: 'SERVICIO_VALIDATION',
        message: 'Nombre, duración y precio son obligatorios.',
      });
    }

    ServicioModel.actualizar(id, {
      nombre,
      descripcion,
      duracionMinutos,
      precio,
      mostrarPrecio: Boolean(mostrarPrecio),
      activo: Boolean(activo),
    });

    const actualizado = ServicioModel.obtenerTodos().find((s) => s.id === id);
    res.json({
      exito: true,
      mensaje: 'Servicio actualizado correctamente.',
      data: actualizado,
    });
  } catch (error) {
    next(error);
  }
};

exports.eliminarServicio = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existente = ServicioModel.buscarPorId(id);

    if (!existente) {
      return res.status(404).json({
        exito: false,
        errorId: 404050,
        errorCode: 'SERVICIO_NOT_FOUND',
        message: 'Servicio no encontrado.',
      });
    }

    ServicioModel.desactivar(id);
    res.json({
      exito: true,
      mensaje: 'Servicio desactivado correctamente.',
    });
  } catch (error) {
    next(error);
  }
};
