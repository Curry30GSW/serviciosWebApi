const CertificadoRentaModel = require('../models/certificadoRentaModel');

const CertificadoRentaController = {

    async getCuentasPorCedula(req, res) {
        try {
            const { cedula } = req.query;
            if (!cedula) {
                return res.status(400).json({ success: false, message: 'Debe enviar la cédula' });
            }

            const cuentas = await CertificadoRentaModel.obtenerCuentasPorCedula(cedula);

            res.status(200).json({
                success: true,
                data: cuentas
            });
        } catch (error) {
            console.error('Error en getCuentasPorCedula:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener cuentas por cédula',
                error: error.message
            });
        }
    },


    async getCertificadoRenta(req, res) {
        try {
            const { libreria, cuenta, inicio, fin, year } = req.query;
            // Estos parámetros vendrán del frontend (pueden ser query o body)

            // 1. Info general del certificado
            const certificado = await CertificadoRentaModel.getCertificadoData(libreria, cuenta);

            // 2. Créditos capital
            const capital = await CertificadoRentaModel.getRegistro(libreria, cuenta);

            // 3. Créditos otros
            const otros = await CertificadoRentaModel.consultaOtros(libreria, cuenta, inicio, fin);

            // 4. Crédito vivienda
            const vivienda = await CertificadoRentaModel.consultaVivi(libreria, cuenta, inicio, fin);

            // 5. Fondo solidario
            const fondoSolidario = await CertificadoRentaModel.fondoSolidario(cuenta, year);

            // 6. Intereses (corriente y mora)
            const intereses = await CertificadoRentaModel.getIntereses(libreria, cuenta, fin);

            // 7. Revalorización de aportes
            const reAportes = await CertificadoRentaModel.reAportes(libreria, cuenta);

            // Respuesta unificada
            res.status(200).json({
                success: true,
                data: {
                    certificado,
                    capital,
                    otros,
                    vivienda,
                    fondoSolidario,
                    intereses,
                    reAportes,
                },
            });
        } catch (error) {
            console.error('Error en getCertificadoRenta:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error al generar el certificado de renta',
                error: error.message,
            });
        }
    },


};

module.exports = CertificadoRentaController;
