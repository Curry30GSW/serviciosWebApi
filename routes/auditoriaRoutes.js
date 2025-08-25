const express = require('express');
const router = express.Router();
const AuditoriaController = require('../controllers/auditoriaController');
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/auditoria', authenticateToken, AuditoriaController.obtenerAuditoria);

module.exports = router;
