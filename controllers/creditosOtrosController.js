const creditosOtrosModel = require('../models/creditosOtrosModel');

const creditosOtrosController = {
    /**
     * Controlador para obtener el total de los créditos "Otros" según los parámetros.
     * @param {Object} req - Objeto de solicitud.
     * @param {Object} res - Objeto de respuesta.
     */
    async getConsultaOtros(req, res) {
        try {
            const { libreria, cuenta, inicio, fin } = req.params;

            // Llama al modelo para obtener los datos
            const result = await creditosOtrosModel.consultaOtros(libreria, cuenta, inicio, fin);

            // Verifica si se obtuvo resultado
            if (result.length > 0) {
                return res.status(200).json({
                    status: 200,
                    data: result,
                });
            } else {
                return res.status(404).json({
                    status: 404,
                    message: 'No se encontraron registros para los parámetros proporcionados.',
                });
            }
        } catch (error) {
            console.error('Error en getConsultaOtros:', error.message);
            return res.status(500).json({
                status: 500,
                error: 'Error al procesar la solicitud.',
            });
        }
    },
};

module.exports = creditosOtrosController;
