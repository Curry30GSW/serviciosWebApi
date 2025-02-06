const { executeQuery } = require('../config/db');

const creditosModel = {
  async getIntereses(libreria, cuenta, fin) {
    try {
      const tableACP13 = `${libreria}.ACP13`;
      const tableACP14 = `${libreria}.ACP14`;

      const query = `
        SELECT
          SUM(${tableACP14}.CINT14 + ${tableACP14}.CICO14) AS Corriente,
          SUM(${tableACP14}.SIMO14) AS Mora
        FROM
          ${tableACP13}
        INNER JOIN
          ${tableACP14}
        ON
          ${tableACP13}.NCTA13 = ${tableACP14}.NCTA14
          AND ${tableACP13}.NCRE13 = ${tableACP14}.NCRE14
          AND ${tableACP13}.SCAP13 > 0
        WHERE
          ${tableACP13}.NCTA13 = ?
          AND ${tableACP14}.VCTO14 <= ?
      `;

      // Ejecutar la consulta pasando los parámetros dinámicos
      const result = await executeQuery(query, [cuenta, fin]);

      // Verifica y asigna 0 si los valores son null o undefined
      const corriente = result[0]?.Corriente ?? 0;
      const mora = result[0]?.Mora ?? 0;

      return { corriente, mora };
    } catch (error) {
      console.error('Error al obtener los intereses:', error);
      throw error;
    }
  }
};

module.exports = creditosModel;