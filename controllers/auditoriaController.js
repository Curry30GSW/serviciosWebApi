const AuditoriaModel = require('../models/auditoriaModel');

const obtenerAuditoria = async (req, res) => {
    try {
        const resultados = await AuditoriaModel.listarAuditoria();
        res.json(resultados);
    } catch (error) {
        console.error('Error al obtener auditoría:', error);
        res.status(500).json({ mensaje: 'Error al obtener la auditoría' });
    }
};

module.exports = {
    obtenerAuditoria
};
