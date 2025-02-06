const { executeQuery } = require('../config/db');

const certificadoModel = {
  async getCertificadoData(libreria, cuenta) {
    try {
      const tableACP05 = `${libreria}.ACP05`;
      const tableACP09 = `${libreria}.ACP09`;

      const query = `
        SELECT
          RTRIM(${tableACP05}.DESC05) AS Nombre,
          RTRIM(${tableACP05}.NNIT05) AS Cedula,
          RTRIM(${tableACP05}.NCTA05) AS Cuenta,
          RTRIM(${tableACP09}.ASAL09) AS Ordinarios,
          RTRIM(${tableACP09}.DSAL09) AS Ocasionales
        FROM
          ${tableACP05}
        INNER JOIN
          ${tableACP09}
        ON
          ${tableACP05}.NCTA05 = ${tableACP09}.NCTA09
        WHERE
          ${tableACP05}.NCTA05 = ?
      `;

      const result = await executeQuery(query, [cuenta]);
      return result;
    } catch (error) {
      console.error('Error al obtener datos del certificado:', error);
      throw error;
    }
  }

};

module.exports = certificadoModel;
