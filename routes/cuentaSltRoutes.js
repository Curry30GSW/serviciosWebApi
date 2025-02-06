const express = require('express');
const router = express.Router();
const { getCuentas } = require('../controllers/cuentaSltController');
const verifyToken = require('../middlewares/authMiddleware.js');

router.get('/cuentas/:cedula', verifyToken, getCuentas);

module.exports = router;