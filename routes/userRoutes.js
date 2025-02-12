// routes/authRoutes.js
const express = require('express');
const { gestionarRegistro } = require('../controllers/userController');

const router = express.Router();

router.post('/registro', gestionarRegistro);

module.exports = router;