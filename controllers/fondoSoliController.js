const fondoSoliModel = require('../models/fondoSoliModel');

const fondoSoliController = {
    async obtenerFondoSolidario(req, res) {
        try {
            // Obtiene los parámetros desde la solicitud
            const { cuenta, year } = req.params;

            // Llama al modelo para obtener los datos
            const resultado = await fondoSoliModel.fondoSolidario(cuenta, year);

            if (resultado.length > 0) {
                // Si se encuentra resultado, asegura que VDES40 nunca sea null
                res.status(200).json({
                    data: {
                        VDES40: resultado[0].VDES40 || 0, // Reemplaza null por 0
                    },
                });
            } else {
                res.status(200).json({
                    data: { VDES40: 0 },
                    message: 'No se encontraron registros para el fondo solidario.',
                });
            }
        } catch (error) {
            console.error('Error en obtenerFondoSolidario:', error.message);
            res.status(500).json({
                error: 'Ocurrió un error al obtener el fondo solidario.',
            });
        }
    },
};

module.exports = fondoSoliController;
