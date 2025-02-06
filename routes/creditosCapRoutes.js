const express = require('express');
const creditosCapController = require('../controllers/creditosCapController');
const verifyToken = require('../middlewares/authMiddleware.js');

const router = express.Router();

// Ruta para obtener el registro
// Ejemplo: GET /creditos-cap/:libreria/:cuenta
router.get('/creditos-cap/:libreria/:cuenta', verifyToken, creditosCapController.obtenerRegistro);

module.exports = router;
