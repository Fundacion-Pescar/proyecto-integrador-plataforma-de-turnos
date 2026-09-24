const express = require('express');
const turnoController = require('../controllers/turnoController');
const servicioController = require('../controllers/servicioController');
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Auth
router.post('/auth/login', authController.login);
router.get('/auth/me', requireAuth, authController.me);

// Público (landing / MVP conectado a API)
router.get('/servicios', servicioController.obtenerServicios);
router.post('/turnos', turnoController.crearTurno);
router.post('/chat', chatController.procesarChat);
router.post('/notificaciones/confirmar', async (req, res, next) => {
  try {
    const { enviarConfirmacionExterna } = require('../services/notificacionService');
    const resultado = await enviarConfirmacionExterna({
      id: req.body.id || 0,
      cliente: req.body.cliente || 'Cliente',
      servicio: req.body.servicio || 'Servicio',
      fecha: req.body.fecha || new Date().toISOString().slice(0, 10),
      hora: req.body.hora || '',
    });
    res.json({ exito: true, notificacionExterna: resultado });
  } catch (error) {
    next(error);
  }
});

// Backoffice — turnos
router.get('/turnos', requireAuth, turnoController.obtenerTurnos);
router.get('/turnos/:id', requireAuth, turnoController.obtenerTurnoPorId);
router.patch('/turnos/:id', requireAuth, turnoController.actualizarTurno);
router.post('/turnos/:id/confirmar', requireAuth, turnoController.confirmarTurno);
router.delete('/turnos/:id', requireAuth, turnoController.cancelarTurno);

// Backoffice — tipos / servicios médicos
router.get('/admin/servicios', requireAuth, servicioController.obtenerTodosAdmin);
router.post('/admin/servicios', requireAuth, servicioController.crearServicio);
router.patch('/admin/servicios/:id', requireAuth, servicioController.actualizarServicio);
router.delete('/admin/servicios/:id', requireAuth, servicioController.eliminarServicio);

module.exports = router;
