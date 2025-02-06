const { connectToDatabase } = require('../config/db');

const obtenerCuentasPorCedula = async (cedula) => {
    try {
        const conn = await connectToDatabase();
        const query = `
      SELECT NCTA05, DESC04 
      FROM COLIB.ACP05, COLIB.ACP04 
      WHERE NNIT05 = ? AND NOMI05 = NOMI04
    `;
        const result = await conn.query(query, [cedula]);

        return result.map(row => ({
            cuenta: row.NCTA05,
            nomina: row.DESC04.replace("�", "N") // Reemplazo de carácter especial
        }));
    } catch (error) {
        console.error('Error en obtenerCuentasPorCedula:', error);
        throw error;
    }
};

module.exports = { obtenerCuentasPorCedula };
