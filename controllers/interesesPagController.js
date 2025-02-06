const interesPagModel = require('../models/interesesPagModel');

const interesPagController = {
    async obtenerVivienda(req, res) {
        try {
            const { libreria, cuenta, inicio, fin } = req.params;

            const resultado = await interesPagModel.consultaVivi(libreria, cuenta, inicio, fin);

            // Si no hay resultados, devuelve un valor de cero
            if (resultado.length > 0) {
                res.status(200).json({
                    data: resultado,
                });
            } else {
                res.status(200).json({
                    data: [{ Creditos_Vivienda: 0 }], // Devuelve cero como valor
                });
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                error: 'Ocurrió un error al realizar la consulta de vivienda.',
            });
        }
    },

    async obtenerOtros(req, res) {
        try {
            const { libreria, cuenta, inicio, fin } = req.params;

            const resultado = await interesPagModel.consultaOtros(libreria, cuenta, inicio, fin);

            // Si no hay resultados, devuelve un valor de cero
            if (resultado.length > 0) {
                res.status(200).json({
                    data: resultado,
                });
            } else {
                res.status(200).json({
                    data: [{ Otros_Creditos: 0 }], // Devuelve cero como valor
                });
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                error: 'Ocurrió un error al realizar la consulta de otros.',
            });
        }
    },
};

module.exports = interesPagController;
