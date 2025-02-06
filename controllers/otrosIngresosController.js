const otrosIngresosModel = require('../models/otrosIngresosModel');

const otrosIngresosController = {
    async obtenerAportes(req, res) {
        try {
            const { libreria, cuenta } = req.params;

            const resultado = await otrosIngresosModel.reAportes(libreria, cuenta);

            if (resultado.length > 0) {
                res.status(200).json({
                    status: 200,
                    data: resultado,
                });
            } else {
                res.status(200).json({
                    status: 200,
                    data: [],
                    message: 'No se encontraron registros para los aportes.',
                });
            }
        } catch (error) {
            console.error('Error en obtenerAportes:', error.message);
            res.status(500).json({
                status: 500,
                error: 'Ocurrió un error al obtener los aportes.',
            });
        }
    },
};

module.exports = otrosIngresosController;
