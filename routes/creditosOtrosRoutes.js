const express = require('express');
const router = express.Router();
const creditosOtrosController = require('../controllers/creditosOtrosController');
const verifyToken = require('../middlewares/authMiddleware.js');

router.get('/consulta-otros/:libreria/:cuenta/:inicio/:fin', verifyToken, creditosOtrosController.getConsultaOtros);

module.exports = router;


///REVISION