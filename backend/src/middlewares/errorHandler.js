function notFoundHandler(req, res) {
  res.status(404).json({
    exito: false,
    errorId: 404001,
    errorCode: 'ENDPOINT_NOT_FOUND',
    message: 'Endpoint no encontrado',
  });
}

function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    exito: false,
    errorId: err.errorId || 500001,
    errorCode: err.errorCode || 'INTERNAL_ERROR',
    message: err.message || 'Error interno del servidor',
  });
}

module.exports = { notFoundHandler, errorHandler };
