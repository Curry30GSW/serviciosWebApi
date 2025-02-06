const { executeQuery } = require('../config/db');

const creditosCapModel = {
  async getRegistro(libreria, cuenta) {
    try {
      const tableACP13 = `${libreria}.ACP13`;

      const query = `
                SELECT
                    SUM(${tableACP13}.SCAP13) AS SCAP13
                FROM
                    ${tableACP13}
                WHERE
                    ${tableACP13}.NCTA13 = ?
                    AND ${tableACP13}.SCAP13 > 0
            `;

      const result = await executeQuery(query, [cuenta]);

      // Verifica si el resultado es null o undefined y reemplázalo por 0
      const SCAP13 = result[0]?.SCAP13 ?? 0;

      return SCAP13;
    } catch (error) {
      console.error('Error al obtener registro:', error.message);
      throw error;
    }
  },
};

module.exports = creditosCapModel;