// controllers/authController.js
const { verificarAsociado, actualizarUsuario, registrarUsuario } = require('../models/userModel');

const gestionarRegistro = async (req, res) => {
    const { cedula, fecha, correo, pwd } = req.body;

    try {
        const asociado = await verificarAsociado(cedula, fecha);

        if (!asociado) {
            return res.json({ registrado: 2, message: 'No es asociado o fecha incorrecta' });
        }

        if (asociado.PWNIT) {
            await actualizarUsuario(cedula, correo, pwd);
            return res.json({ registrado: 0, message: 'Usuario actualizado' });
        } else {
            await registrarUsuario(cedula, correo, pwd);
            return res.json({ registrado: 1, message: 'Usuario registrado' });
        }
    } catch (error) {
        console.error('Error en el proceso de registro:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { gestionarRegistro };