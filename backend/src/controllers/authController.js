const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');

function firmarToken(admin) {
  const secret = process.env.JWT_SECRET || 'odontoturno_dev_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

  return jwt.sign(
    {
      sub: admin.id,
      email: admin.email,
      nombre: admin.nombre,
      rol: 'admin',
    },
    secret,
    { expiresIn }
  );
}

exports.login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        exito: false,
        errorId: 400030,
        errorCode: 'AUTH_MISSING_FIELDS',
        message: 'Email y contraseña son obligatorios.',
      });
    }

    const admin = AdminModel.buscarPorEmail(email);

    if (!admin || !admin.activo) {
      return res.status(401).json({
        exito: false,
        errorId: 401001,
        errorCode: 'AUTH_INVALID_CREDENTIALS',
        message: 'Credenciales inválidas.',
      });
    }

    const ok = AdminModel.verificarPassword(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({
        exito: false,
        errorId: 401001,
        errorCode: 'AUTH_INVALID_CREDENTIALS',
        message: 'Credenciales inválidas.',
      });
    }

    const token = firmarToken(admin);

    res.json({
      exito: true,
      mensaje: 'Inicio de sesión exitoso',
      data: {
        token,
        admin: {
          id: admin.id,
          nombre: admin.nombre,
          email: admin.email,
          rol: 'admin',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.me = (req, res) => {
  res.json({
    exito: true,
    data: {
      id: req.admin.id,
      nombre: req.admin.nombre,
      email: req.admin.email,
      rol: 'admin',
    },
  });
};
