const jwt = require('jsonwebtoken');  // Importar jsonwebtoken
const loginModel = require("../middlewares/authModel");
require('dotenv').config();

class authController {
    static async login(req, res) {
        const { cedula, password } = req.body; // Recibe el cedula y la contraseña

        try {
            // Llamamos al modelo para buscar al usuario con el cedula
            const userResponse = await loginModel.login(cedula, password);

            // Si el usuario no se encuentra o la contraseña no es correcta
            if (!userResponse.success) {
                return res.status(404).json({ message: userResponse.message });
            }

            const user = userResponse.user;

            // Si el inicio de sesión es exitoso, generamos un JWT
            const token = jwt.sign(
                { nnit: user.NNIT05, mail: user.MAIL05, descripcion: user.DESC05 },  // Payload (los datos del usuario que deseas incluir)
                process.env.JWT_SECRET,  // Utiliza la variable de entorno JWT_SECRET
                { expiresIn: '1h' }  // Establece el tiempo de expiración del token (1 hora en este caso)
            );

            // Responde con los datos del usuario y el token
            return res.status(200).json({
                success: true,
                message: "Inicio de sesión exitoso",
                user: {
                    nnit: user.NNIT05,
                    mail: user.MAIL05,
                    descripcion: user.DESC05,
                    ultimaConexionFecha: user.ULTFEING,  // Solo la fecha (YYYY-MM-DD)
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

// Exporta la clase directamente
module.exports = authController;