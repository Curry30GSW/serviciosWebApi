// models/CertificadoRentaModel.js
const { executeQuery, connectToDatabase } = require('../config/db');

const CertificadoRentaModel = {
    async getCertificadoData(libreria, cuenta) {
        try {
            const query = `
        SELECT
            RTRIM(${libreria}.ACP05.DESC05) AS Nombre,
            RTRIM(${libreria}.ACP05.NNIT05) AS Cedula,
            RTRIM(${libreria}.ACP05.NCTA05) AS Cuenta,
            RTRIM(${libreria}.ACP09.ASAL09) AS Ordinarios,
            RTRIM(${libreria}.ACP09.DSAL09) AS Ocasionales,
            RTRIM(${libreria}.ACP04.DESC04) AS Nomina
        FROM
            ${libreria}.ACP05
        INNER JOIN
            ${libreria}.ACP09
            ON ${libreria}.ACP05.NCTA05 = ${libreria}.ACP09.NCTA09
        INNER JOIN
            ${libreria}.ACP04
            ON ${libreria}.ACP05.NOMI05 = ${libreria}.ACP04.NOMI04
        WHERE
            ${libreria}.ACP05.NCTA05 = ?

      `;
            return await executeQuery(query, [cuenta]);
        } catch (error) {
            console.error('Error en getCertificadoData:', error);
            throw error;
        }
    },

    // 📌 Créditos Capital
    async getRegistro(libreria, cuenta) {
        try {
            const query = `
        SELECT SUM(${libreria}.ACP13.SCAP13) AS SCAP13
        FROM ${libreria}.ACP13
        WHERE NCTA13 = ?
          AND SCAP13 > 0
      `;
            const result = await executeQuery(query, [cuenta]);
            return result[0]?.SCAP13 ?? 0;
        } catch (error) {
            console.error('Error en getRegistro:', error);
            throw error;
        }
    },

    // 📌 Créditos Otros
    async consultaOtros(libreria, cuenta, inicio, fin) {
        try {
            const query = `
        SELECT 
          SUM(SINT11 + SICO11 + SIMO11 + SCJO11) AS OTROS
        FROM ${libreria}.ACP11
        WHERE NCTA11 = ?
          AND LAPS11 BETWEEN ? AND ?
          AND TMOV11 IN ('10', '11', '12', '53')
          AND TCRE11 NOT IN ('16', '18')
      `;
            return await executeQuery(query, [cuenta, inicio, fin]);
        } catch (error) {
            console.error('Error en consultaOtros:', error);
            throw error;
        }
    },

    // 📌 Créditos Vivienda
    async consultaVivi(libreria, cuenta, inicio, fin) {
        try {
            const query = `
        SELECT 
          SUM(SINT11 + SICO11 + SIMO11 + SCJO11) AS CREDITO_VIVIENDA
        FROM ${libreria}.ACP11
        WHERE NCTA11 = ?
          AND LAPS11 BETWEEN ? AND ?
          AND TMOV11 IN ('10', '11', '12', '53')
        GROUP BY TCRE11
        HAVING TCRE11 IN ('16', '18')
      `;
            return await executeQuery(query, [cuenta, inicio, fin]);
        } catch (error) {
            console.error('Error en consultaVivi:', error);
            throw error;
        }
    },

    // 📌 Obtener cuentas por cédula
    async obtenerCuentasPorCedula(cedula) {
        try {
            const conn = await connectToDatabase();
            const query = `
        SELECT NCTA05, DESC05, DESC04
        FROM COLIB.ACP05, COLIB.ACP04 
        WHERE NNIT05 = ? AND NOMI05 = NOMI04
      `;
            const result = await conn.query(query, [cedula]);

            return result.map(row => ({
                cuenta: row.NCTA05,
                nombre: row.DESC05,
                nomina: row.DESC04.replace("�", "N")
            }));
        } catch (error) {
            console.error('Error en obtenerCuentasPorCedula:', error);
            throw error;
        }
    },

    // 📌 Fondo Solidario
    async fondoSolidario(cuenta, year) {
        try {
            const query = `
        SELECT SUM(VDES40) AS VDES40
        FROM COLIB.ACP40
        WHERE NCTA40 = ?
          AND ESOL40 = '1'
          AND SUBSTR(FAPR40, 1, 4) = ?
          AND TAUX40 IN (0, 1, 2, 3)
      `;
            const result = await executeQuery(query, [cuenta, year]);
            return result[0]?.VDES40 ?? 0;
        } catch (error) {
            console.error('Error en fondoSolidario:', error);
            throw error;
        }
    },

    // 📌 Intereses (Corriente y Mora)
    async getIntereses(libreria, cuenta, fin) {
        try {
            const query = `
        SELECT
          SUM(${libreria}.ACP14.CINT14 + ${libreria}.ACP14.CICO14) AS Corriente,
          SUM(${libreria}.ACP14.SIMO14) AS Mora
        FROM ${libreria}.ACP13
        INNER JOIN ${libreria}.ACP14
          ON ${libreria}.ACP13.NCTA13 = ${libreria}.ACP14.NCTA14
          AND ${libreria}.ACP13.NCRE13 = ${libreria}.ACP14.NCRE14
          AND ${libreria}.ACP13.SCAP13 > 0
        WHERE ${libreria}.ACP13.NCTA13 = ?
          AND ${libreria}.ACP14.VCTO14 <= ?
      `;
            const result = await executeQuery(query, [cuenta, fin]);
            return {
                corriente: result[0]?.Corriente ?? 0,
                mora: result[0]?.Mora ?? 0
            };
        } catch (error) {
            console.error('Error en getIntereses:', error);
            throw error;
        }
    },

    // 📌 Otros ingresos (Revalorización de aportes)
    async reAportes(libreria, cuenta) {
        try {
            const query = `
        SELECT FECH09, CSAL09 AS REVALORIZACION
        FROM ${libreria}.ACP09A
        WHERE NCTA09 = ?
      `;
            return await executeQuery(query, [cuenta]);
        } catch (error) {
            console.error('Error en reAportes:', error);
            throw error;
        }
    },

};

module.exports = CertificadoRentaModel;
