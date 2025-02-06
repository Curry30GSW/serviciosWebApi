const express = require('express');
const otrosIngresosController = require('../controllers/otrosIngresosController');
const verifyToken = require('../middlewares/authMiddleware.js');

const router = express.Router();

// Ruta para obtener aportes
router.get('/aportes/:libreria/:cuenta', verifyToken, otrosIngresosController.obtenerAportes);

module.exports = router;
