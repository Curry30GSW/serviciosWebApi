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
            const { libreria, cedula, inicio, fin, year } = req.query;
            if (!cedula) {
                return res.status(400).json({ success: false, message: 'Debe enviar la cédula' });
            }

            // 1️⃣ Buscar todas las cuentas del socio
            const cuentas = await CertificadoRentaModel.obtenerCuentasPorCedula(cedula);

            if (!cuentas || cuentas.length === 0) {
                return res.status(404).json({ success: false, message: 'No se encontraron cuentas para esa cédula' });
            }

            // 2️⃣ Iterar sobre cuentas y ejecutar todas las consultas en paralelo
            const resultados = await Promise.all(
                cuentas.map(async (c) => {
                    const [
                        socio,
                        capital,
                        otros,
                        vivienda,
                        fondoSolidario,
                        intereses,
                        reAportes
                    ] = await Promise.all([
                        CertificadoRentaModel.getCertificadoData(libreria, c.cuenta),
                        CertificadoRentaModel.getRegistro(libreria, c.cuenta),
                        CertificadoRentaModel.consultaOtros(libreria, c.cuenta, inicio, fin),
                        CertificadoRentaModel.consultaVivi(libreria, c.cuenta, inicio, fin),
                        CertificadoRentaModel.fondoSolidario(c.cuenta, year),
                        CertificadoRentaModel.getIntereses(libreria, c.cuenta, fin),
                        CertificadoRentaModel.reAportes(libreria, c.cuenta)
                    ]);

                    return {
                        cuenta: c.cuenta,
                        socio,
                        capital,
                        otros,
                        vivienda,
                        fondoSolidario,
                        intereses,
                        reAportes
                    };
                })
            );

            // 3️⃣ Responder con array de JSONs
            res.status(200).json({ success: true, data: resultados });

        } catch (error) {
            console.error('Error en getCertificadoRenta:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error al generar el certificado de renta',
                error: error.message
            });
        }
    }





};

module.exports = CertificadoRentaController;
