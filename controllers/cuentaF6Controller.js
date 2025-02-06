const cuentaF6Model = require('../models/cuentaF6Model');

const cuentaF6Controller = {
    async getCuentaData(req, res) {
        try {
            const { cuenta } = req.params;

            const cuentaData = await cuentaF6Model.getCuentaData(cuenta);

            res.status(200).json({
                success: true,
                data: cuentaData
            });
        } catch (error) {
            console.error('Error en el controlador:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los datos de la cuenta',
                error: error.message
            });
        }
    }
};

module.exports = cuentaF6Controller;
