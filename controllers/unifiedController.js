const certificadoModel = require('../models/certificadoModel');
const creditosCapModel = require('../models/creditosCapModel');
const interesesVenModel = require('../models/interesesVenModel');
const creditosViviModel = require('../models/creditosViviModel');
const creditosOtrosModel = require('../models/creditosOtrosModel');
const otrosIngresosModel = require('../models/otrosIngresosModel');
const fondoSoliModel = require('../models/fondoSoliModel');

const unifiedController = {
    async obtenerDatosUnificados(req, res) {
        try {
            // Extraer los parámetros de la solicitud
            const { libreria, cuenta, inicio, fin, year } = req.query; // Ajusta según los parámetros que uses

            // Llamadas a todos los modelos o servicios
            const [
                certificados,
                creditosCapital,
                interesesVencidos,
                creditosVivienda,
                creditosOtros,
                otrosIngresos,
                fondoSolidario,
            ] = await Promise.all([
                certificadoModel.getCertificadoData(libreria, cuenta), //este
                creditosCapModel.getRegistro(libreria, cuenta),
                interesesVenModel.getIntereses(libreria, cuenta, fin),
                creditosViviModel.consultaVivi(libreria, cuenta, inicio, fin),
                creditosOtrosModel.consultaOtros(libreria, cuenta, inicio, fin),
                otrosIngresosModel.reAportes(libreria, cuenta),
                fondoSoliModel.fondoSolidario(cuenta, year)
            ]);

            // Función para reemplazar arrays vacíos o null con 0
            const handleEmpty = (data) => {
                if (data === null || data === undefined || (Array.isArray(data) && data.length === 0)) {
                    return 0;
                }
                return data;
            };

            // Consolidar todos los resultados en un solo objeto, manejando vacíos
            const data = {
                certificados: handleEmpty(certificados),
                creditosCapital: handleEmpty(creditosCapital),
                interesesVencidos: handleEmpty(interesesVencidos),
                creditosVivienda: handleEmpty(creditosVivienda),
                creditosOtros: handleEmpty(creditosOtros),
                otrosIngresos: handleEmpty(otrosIngresos),
                fondoSolidario: handleEmpty(fondoSolidario),
            };

            res.status(200).json({
                status: 200,
                data,
            });
        } catch (error) {
            console.error('Error en obtenerDatosUnificados:', error.message);
            res.status(500).json({
                status: 500,
                error: 'Ocurrió un error al obtener los datos unificados.',
            });
        }
    },
};

module.exports = unifiedController;