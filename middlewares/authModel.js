const { executeQuery } = require('../config/db');

const validarFechaExpedicion = async (cedula, fechaExpedicion) => {
    fechaExpedicion = Number(fechaExpedicion); // Convertir a número
    const sql = "SELECT * FROM COLIB.ACP054 WHERE CEDU05 = ? AND FEXP05 = ?";

    try {
        const result = await executeQuery(sql, [cedula, fechaExpedicion]);
        return result.length > 0;
    } catch (error) {
        console.error('Error validando la fecha de expedición:', error);
        return false;
    }
};

const login = async (cedula, password, fechaExpedicion) => {
    fechaExpedicion = Number(fechaExpedicion); // Convertir a número

    // Validar la fecha de expedición primero
    const fechaValida = await validarFechaExpedicion(cedula, fechaExpedicion);
    if (!fechaValida) {
        return { success: false, message: 'Fecha de expedición incorrecta' };
    }

    // Consulta para validar usuario y contraseña
    const sql = `
    SELECT ACP05.NNIT05, PASSPW, MAIL05, TIPOPW, ESTAPW, DESC05, 
           (FECHAEPW) ULTFEING, (FECHAEPW) ULTHRING, IPPW, MAX(ID) ID
    FROM COLIB.ACP05PW ACP05PW
    INNER JOIN COLIB.ACP05 ACP05 ON ACP05PW.NNIT05 = ACP05.NNIT05
    LEFT JOIN COLIB.SESIONES SESIONES ON ACP05.NNIT05 = SESIONES.NNITPW
    WHERE ACP05PW.NNIT05 = ? 
    AND ESTAPW = 1
    GROUP BY ACP05.NNIT05, PASSPW, MAIL05, TIPOPW, ESTAPW, DESC05, FECHAEPW, IPPW
    ORDER BY FECHAEPW DESC 
    FETCH FIRST ROWS ONLY
    `;

    try {
        const result = await executeQuery(sql, [cedula]);

        if (result.length === 0) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const user = result[0];

        if (!user.PASSPW) {
            return { success: false, message: 'Contraseña incorrecta' };
        }

        const cleanedPassword = user.PASSPW.trim();
        const cleanedInputPassword = password.trim();

        if (cleanedPassword !== cleanedInputPassword) {
            return { success: false, message: 'Contraseña incorrecta' };
        }

        await saveSession(user.NNIT05);

        return { success: true, user: user };
    } catch (error) {
        console.error('Error en consulta:', error);
        return { success: false, message: 'Error al validar los datos' };
    }
};

const saveSession = async (nit) => {
    const ip = '192.168.0.1'; // Obtener IP dinámicamente si es necesario
    const finicio = new Date().toISOString().slice(0, 19).replace('T', ' '); // Ajuste de formato
    const f = '0001-01-01 00:00:00'; // Ajuste de formato para la base de datos

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