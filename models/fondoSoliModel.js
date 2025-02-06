const { executeQuery } = require('../config/db'); // Asegúrate de que esta ruta sea correcta

class fondoSoliModel {
    static async fondoSolidario(cuenta, year) {
        // Tabla base
        const table = 'COLIB.ACP40';

        // Consulta SQL
        const query = `
            SELECT SUM(VDES40) AS VDES40
            FROM ${table}
            WHERE NCTA40 = ?
              AND ESOL40 = '1'
              AND SUBSTR(FAPR40, 1, 4) = ?
              AND TAUX40 IN (0, 1, 2, 3)
        `;

        try {
            // Ejecuta la consulta con los parámetros necesarios
            const resultado = await executeQuery(query, [cuenta, year]);

            // Verifica si el resultado es null y lo reemplaza por 0
            const VDES40 = resultado[0]?.VDES40 ?? 0;

            // Retorna el valor VDES40 (0 si es null)
            return VDES40;
        } catch (error) {
            console.error('Error en fondoSolidario:', error.message);
            throw new Error('Error al consultar el fondo solidario.');
        }
    }
}

module.exports = fondoSoliModel;
