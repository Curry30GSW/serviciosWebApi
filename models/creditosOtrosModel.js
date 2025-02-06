const { executeQuery } = require('../config/db');

const creditosOtrosModel = {
    /**
     * Consulta los créditos "Otros" según los parámetros proporcionados.
     * @param {string} libreria - Nombre de la librería.
     * @param {string} cuenta - Número de cuenta.
     * @param {string} inicio - Fecha de inicio.
     * @param {string} fin - Fecha de fin.
     * @returns {Promise<Object[]>} Resultado de la consulta con el total de "OTROS".
     */
    async consultaOtros(libreria, cuenta, inicio, fin) {
        try {
            const tableACP11 = `${libreria}.ACP11`;
            const query = `
                SELECT 
                    SUM(SINT11 + SICO11 + SIMO11 + SCJO11) AS OTROS
                FROM 
                    ${tableACP11}
                WHERE 
                    NCTA11 = ?
                    AND LAPS11 BETWEEN ? AND ?
                    AND TMOV11 IN ('10', '11', '12', '53')
                    AND TCRE11 NOT IN ('16', '18')
            `;

            // Ejecuta la consulta con los parámetros proporcionados
            const result = await executeQuery(query, [cuenta, inicio, fin]);

            return result;
        } catch (error) {
            console.error('Error en consultaOtros:', error.message);
            throw error;
        }
    },
};

module.exports = creditosOtrosModel;
