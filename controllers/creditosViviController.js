const creditosViviModel = require('../models/creditosViviModel');

const creditosViviController = {
    async getConsultaVivi(req, res) {
        try {
            const { libreria, cuenta, inicio, fin } = req.params;

            // Llama al modelo para obtener los datos
            const result = await creditosViviModel.consultaVivi(libreria, cuenta, inicio, fin);

            // Si hay resultados, los envía, de lo contrario, manda 0
            res.status(200).json({
                CREDVIVIENDA: result.length > 0 ? result : [0],
            });
        } catch (error) {
            // Manejo de errores
            console.error('Error al procesar la solicitud:', error.message); // Agrega un log para depurar
            res.status(500).json({
                status: 500,
                error: 'Error al procesar la solicitud.',
            });
        }
    },
};

module.exports = creditosViviController;