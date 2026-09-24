const { responderConsulta } = require('../services/iaService');

exports.procesarChat = async (req, res, next) => {
  try {
    const { mensaje } = req.body;
    if (!mensaje || String(mensaje).trim() === '') {
      return res.status(400).json({
        exito: false,
        errorId: 400020,
        errorCode: 'MENSAJE_OBLIGATORIO',
        message: 'El mensaje es obligatorio.',
      });
    }

    const resultado = await responderConsulta(mensaje);
    res.json({
      exito: true,
      respuesta: resultado.respuesta,
      meta: {
        fuenteDatos: resultado.fuenteDatos,
      },
    });
  } catch (error) {
    next(error);
  }
};
