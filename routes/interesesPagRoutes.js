const express = require('express');
const interesPagController = require('../controllers/interesesPagController');
const verifyToken = require('../middlewares/authMiddleware.js');

const router = express.Router();

// Rutas para las consultas

router.get('/acp11/vivienda/:libreria/:cuenta/:inicio/:fin', verifyToken, interesPagController.obtenerVivienda);


router.get('/acp11/otros/:libreria/:cuenta/:inicio/:fin', verifyToken, interesPagController.obtenerOtros);

module.exports = router;
