const { executeQuery } = require('../config/db'); // Asegúrate de que la ruta sea correcta

class OtrosIngresosModel {
    static async reAportes(libreria, cuenta) {
        const table = `${libreria}.ACP09A`;

        const query = `
            SELECT FECH09, CSAL09 AS REVALORIZACION
            FROM ${table}
            WHERE NCTA09 = ?
        `;

        try {
            // Llama a executeQuery con el query y los parámetros necesarios
            const resultado = await executeQuery(query, [cuenta]);
            return resultado;
        } catch (error) {
            console.error('Error en reAportes:', error.message);
            throw new Error('Error al consultar los aportes.');
        }
    }
}

module.exports = OtrosIngresosModel;
