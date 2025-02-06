const express = require('express');
const router = express.Router();
const fondoSoliController = require('../controllers/fondoSoliController');
const verifyToken = require('../middlewares/authMiddleware.js');

// Ruta para obtener el fondo solidario
router.get('/fondoSolidario/:cuenta/:year', verifyToken, fondoSoliController.obtenerFondoSolidario);

module.exports = router;
