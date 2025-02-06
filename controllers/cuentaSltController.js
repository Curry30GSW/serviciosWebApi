const { obtenerCuentasPorCedula } = require('../models/cuentaSltModel');

const getCuentas = async (req, res) => {
    try {
        const { cedula } = req.params;

        if (!cedula) {
            return res.status(400).json({ error: 'La cédula es requerida' });
        }

        const cuentas = await obtenerCuentasPorCedula(cedula);

        return res.json(cuentas);
    } catch (error) {
        console.error('Error en getCuentas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { getCuentas };
