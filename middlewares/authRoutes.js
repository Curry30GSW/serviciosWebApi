const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Importa la clase completa

// Ruta de login
router.post('/login', authController.login); // Usa el método login de la clase authController
router.post('/logout', authController.logout);

module.exports = router;