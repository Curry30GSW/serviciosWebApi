const { executeQuery } = require('../config/db');

const interesPagModel = {
  // Consulta de Vivienda
  async consultaVivi(libreria, cuenta, inicio, fin) {
    try {
      const tableACP11 = `${libreria}.ACP11`;

      const query = `
        SELECT
          SUM(SINT11 + SICO11 + SIMO11 + SCJO11) AS VIVI
        FROM
          ${tableACP11}
        WHERE
          NCTA11 = ?
          AND LAPS11 BETWEEN ? AND ?
          AND TMOV11 IN ('10', '11', '12', '53')
        GROUP BY
          TCRE11
        HAVING
          TCRE11 IN ('16', '18')
      `;

      const result = await executeQuery(query, [cuenta, inicio, fin]);
      return result;
    } catch (error) {
      console.error('Error en consultaVivi:', error.message);
      throw error;
    }
  },

  // Consulta de Otros
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

      const result = await executeQuery(query, [cuenta, inicio, fin]);
      return result;
    } catch (error) {
      console.error('Error en consultaOtros:', error.message);
      throw error;
    }
  },
};

module.exports = interesPagModel;
