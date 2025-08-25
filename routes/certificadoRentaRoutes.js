const express = require('express');
const router = express.Router();
const CertificadoRentaController = require('../controllers/certificadoRentaController');

// GET -> http://localhost:5000/api/certificado-renta?libreria=colib1224&cuenta=122613&inicio=12401&fin=12412&year=2024
router.get('/certificado-renta', CertificadoRentaController.getCertificadoRenta);

//  Buscar cuentas por cédula
router.get('/certificado-renta/cuentas', CertificadoRentaController.getCuentasPorCedula);

module.exports = router;
