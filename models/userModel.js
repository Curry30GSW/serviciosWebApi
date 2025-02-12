// models/authModel.js
const { executeQuery } = require('../config/db');

// Función para verificar si el usuario es un asociado válido
const verificarAsociado = async (cedula, fecha) => {
    const sql = `
    SELECT pw.nnit05 AS PWNIT, acp05.nnit05 AS ACPNIT 
    FROM colib.acp05 acp05 
    LEFT JOIN colib.acp05pw pw ON acp05.nnit05 = pw.nnit05
    WHERE acp05.nnit05 = ? AND FECN05 = ? FETCH FIRST 1 ROWS ONLY`;

    const result = await executeQuery(sql, [cedula, fecha]);
    return result.length > 0 ? result[0] : null;
};

// Función para actualizar la contraseña y el correo
const actualizarUsuario = async (cedula, correo, pwd) => {
    const sql = `UPDATE COLIB.ACP05PW SET PASSPW = ?, MAIL05 = ? WHERE NNIT05 = ?`;
    await executeQuery(sql, [pwd, correo, cedula]);
};

// Función para registrar un nuevo usuario
const registrarUsuario = async (cedula, correo, pwd) => {
    const sql = `INSERT INTO COLIB.ACP05PW (NNIT05, PASSPW, MAIL05, TIPOPW, ESTAPW) VALUES (?, ?, ?, '1', '1')`;
    await executeQuery(sql, [cedula, pwd, correo]);
};

module.exports = { verificarAsociado, actualizarUsuario, registrarUsuario };