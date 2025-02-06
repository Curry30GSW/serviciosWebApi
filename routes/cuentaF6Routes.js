const express = require('express');
const router = express.Router();
const cuentaF6Controller = require('../controllers/cuentaF6Controller');
const verifyToken = require('../middlewares/authMiddleware.js');

// Ruta para obtener los datos de la cuenta
router.get('/cuenta/:cuenta', verifyToken, cuentaF6Controller.getCuentaData);

module.exports = router;
