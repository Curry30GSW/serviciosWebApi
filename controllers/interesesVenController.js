const creditosModel = require('../models/interesesVenModel');

const creditosController = {
    async obtenerIntereses(req, res) {
        try {
            const { libreria, cuenta, fin } = req.params; // Librería, cuenta y fecha como parámetros en la URL

            // Llamar al modelo para obtener los intereses
            const interesesInfo = await creditosModel.getIntereses(libreria, cuenta, fin);

            if (interesesInfo.length > 0) {
                res.status(200).json({
                    data: interesesInfo[0],
                });
            } else {
                res.status(404).json({
                    status: 404,
                    message: 'No se encontraron registros con los criterios especificados.',
                });
            }
        } catch (error) {
            console.error('Error al obtener intereses:', error);
            res.status(500).json({
                status: 500,
                message: 'Ocurrió un error al obtener los intereses.',
            });
        }
    },
};

module.exports = creditosController;
