const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({
      exito: false,
      errorId: 401002,
      errorCode: 'AUTH_TOKEN_REQUIRED',
      message: 'Debés iniciar sesión como administrador.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'odontoturno_dev_secret';
    const payload = jwt.verify(token, secret);
    const admin = AdminModel.buscarPorId(payload.sub);

    if (!admin || !admin.activo) {
      return res.status(401).json({
        exito: false,
        errorId: 401003,
        errorCode: 'AUTH_INVALID_TOKEN',
        message: 'Sesión inválida. Volvé a iniciar sesión.',
      });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({
      exito: false,
      errorId: 401003,
      errorCode: 'AUTH_INVALID_TOKEN',
      message: 'Token inválido o expirado.',
    });
  }
}

module.exports = { requireAuth };
