const jwt = require('jsonwebtoken');  // Importar jsonwebtoken
const loginModel = require("../middlewares/authModel");
require('dotenv').config();

class authController {
    static async login(req, res) {
        let { cedula, password, fechaExpedicion } = req.body;

        try {
            // Convertir fechaExpedicion a número antes de enviarlo al modelo
            fechaExpedicion = Number(fechaExpedicion);

            // Llamamos al modelo para buscar al usuario con la cédula y fecha de expedición
            const userResponse = await loginModel.login(cedula, password, fechaExpedicion);

            // Si el usuario no se encuentra o la contraseña no es correcta
            if (!userResponse.success) {
                return res.status(404).json({ message: userResponse.message });
            }

            const user = userResponse.user;

            const token = jwt.sign(
                { nnit: user.NNIT05, mail: user.MAIL05, descripcion: user.DESC05 },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            // Responde con los datos del usuario y el token
            return res.status(200).json({
                success: true,
                message: "Inicio de sesión exitoso",
                user: {
                    nnit: user.NNIT05,
                    mail: user.MAIL05,
                    descripcion: user.DESC05,
                    ultimaConexionFecha: user.ULTFEING,
                    ultimaConexionIP: user.IPPW
                },
                token: token
            });

        } catch (error) {
            console.error("Error en el inicio de sesión:", error);
            return res.status(500).json({ message: "Error al procesar la solicitud" });
        }
    }
}


module.exports = authController;