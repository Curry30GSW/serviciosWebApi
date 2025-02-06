const express = require('express');
const certificadoController = require('../controllers/certificadoController');
const verifyToken = require('../middlewares/authMiddleware.js');

const router = express.Router();


router.get('/certificados/:libreria/:cuenta', verifyToken, certificadoController.mostrarCertificados);

module.exports = router;
