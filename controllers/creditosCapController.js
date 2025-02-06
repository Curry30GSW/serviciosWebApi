const creditosCapModel = require('../models/creditosCapModel');

const creditosCapController = {
    async obtenerRegistro(req, res) {
        try {
            const { libreria, cuenta } = req.params; // Librería y cuenta como parámetros en la URL

            // Llama al modelo para obtener los datos del registro
            const registroInfo = await creditosCapModel.getRegistro(libreria, cuenta);

            if (registroInfo.length > 0 && registroInfo[0].SCAP13 !== null) {
                res.status(200).json({
                    status: 200,
                    data: {
                        CreditosCapital: registroInfo[0].SCAP13 || 0,
                    },
                });
            } else {
                res.status(404).json({
                    status: 404,
                    message: 'No se encontraron registros para la cuenta especificada.',
                });
            }
        } catch (error) {
            console.error('Error al obtener el registro:', error.message);
            res.status(500).json({
                status: 500,
                error: 'Ocurrió un error al obtener el registro.',
            });
        }
    },
};

module.exports = creditosCapController;
