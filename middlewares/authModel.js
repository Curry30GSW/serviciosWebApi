const { executeQuery } = require('../config/db');

const login = async (cedula, password) => {
    const sql = `
    SELECT ACP05.NNIT05, PASSPW, MAIL05, TIPOPW, ESTAPW, DESC05, (FECHAEPW) ULTFEING, 
           (FECHAEPW) ULTHRING, IPPW, MAX(ID) ID
    FROM COLIB.ACP05PW ACP05PW, colib.acp05 acp05
    LEFT JOIN COLIB.SESIONES SESIONES ON ACP05.NNIT05 = SESIONES.NNITPW
    WHERE ACP05PW.NNIT05 = ? AND ACP05PW.NNIT05 = ACP05.NNIT05 AND ESTAPW = 1
    GROUP BY ACP05.NNIT05, PASSPW, MAIL05, TIPOPW, ESTAPW, DESC05, FECHAEPW, IPPW
    ORDER BY FECHAEPW DESC 
    FETCH FIRST ROWS ONLY
  `;

    try {
        const result = await executeQuery(sql, [cedula]);

        // Verifica si la consulta devuelve datos
        if (result.length === 0) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const user = result[0];

        // Verifica si PASSPW está definido y no es null
        if (!user.PASSPW) {
            return { success: false, message: 'Contraseña no encontrada en la base de datos' };
        }

        // Elimina los espacios en el campo PASSPW antes de compararlo
        const cleanedPassword = user.PASSPW.replace(/\s+/g, ''); // Limpiar la contraseña de la base de datos

        // Elimina los espacios de la contraseña proporcionada
        const cleanedInputPassword = password.replace(/\s+/g, ''); // Limpiar la contraseña del input

        // Compara las contraseñas de forma directa sin espacios
        if (cleanedPassword !== cleanedInputPassword) {
            return { success: false, message: 'Contraseña incorrecta' };
        }

        // Guardar la auditoría del login
        await saveSession(user.NNIT05);  // Asegúrate de pasar el NIT del usuario

        return { success: true, user: user };
    } catch (error) {
        console.error('Error en consulta:', error);
        return { success: false, message: 'Error en el servidor' };
    }
};

const saveSession = async (nit) => {
    const ip = '192.168.0.1'; // Obtener IP dinámicamente si es necesario
    const finicio = new Date().toISOString().slice(0, 19).replace('T', '-'); // Asegúrate de que esto es correcto
    const f = '0001-01-01-00.00.00.000000'; // Formato que debe ser ajustado según la base de datos

    const sql = `
    INSERT INTO COLIB.SESIONES (NNITPW, FECHAEPW, FECHASPW, IPPW) 
    VALUES (?, ?, ?, ?)
  `;

    try {
        await executeQuery(sql, [nit, finicio, f, ip]);
    } catch (error) {
        console.error('Error al guardar sesión:', error);
    }
};

module.exports = { login, saveSession };
