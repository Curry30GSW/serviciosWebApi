const express = require('express');
const creditosViviController = require('../controllers/creditosViviController');
const verifyToken = require('../middlewares/authMiddleware.js');

const router = express.Router();

// Ruta para obtener la consulta de créditos de vivienda
router.get('/creditos/vivienda/:libreria/:cuenta/:inicio/:fin', verifyToken, creditosViviController.getConsultaVivi);

module.exports = router;
