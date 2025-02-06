const express = require('express');
const creditosController = require('../controllers/interesesVenController');
const verifyToken = require('../middlewares/authMiddleware.js');

const router = express.Router();

// Ruta para obtener los intereses
router.get('/interesesVen/:libreria/:cuenta/:fin', verifyToken, creditosController.obtenerIntereses);

module.exports = router;
