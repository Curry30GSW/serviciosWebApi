const express = require('express');
const unifiedController = require('../controllers/unifiedController');

const router = express.Router();

// Ruta unificada
router.get('/unified-data', unifiedController.obtenerDatosUnificados);

module.exports = router;

