const { executeQuery } = require('../config/db');

const cuentaF6Model = {
    async getCuentaData(cuenta) {
        try {
            // Definimos los nombres de las tablas
            const tableACP05 = `COLIB.ACP05`;
            const tableACP030 = `COLIB.ACP030`;
            const tableACP04 = `COLIB.ACP04`;
            const tableACP02 = `COLIB.ACP02`;
            const tableACP03 = `COLIB.ACP03`;
            const tableACP09 = `COLIB.ACP09`;
            const tableBIOTRACE = `BIOTRACE.CUENTAS`;
            const tableACP13 = `COLIB.ACP13`;
            const tableACP06 = `COLIB.ACP06`;
            const tableACP14 = `COLIB.ACP14`;
            const tableACP09A = `COLIB.ACP09A`;

            // Consulta de los datos de la cuenta
            const queryCuentaData = `
                SELECT 
                    ${tableACP05}.DIST05, 
                    RTRIM(${tableACP05}.DESC05),
                    ${tableACP05}.FEVI05, 
                    ${tableACP05}.NOMI05, 
                    ${tableACP05}.ENTI05, 
                    ${tableACP05}.DEPE05, 
                    ${tableACP05}.AAUX05, 
                    RTRIM(${tableACP030}.DESC03) AS DCARTERA, 
                    RTRIM(${tableACP04}.DESC04), 
                    RTRIM(${tableACP02}.DESC02), 
                    RTRIM(${tableACP03}.DESC03) AS AGENCIA, 
                    ${tableACP09}.ASAL09, 
                    ${tableACP09}.ACUO09, 
                    ${tableACP09}.DSAL09, 
                    ${tableBIOTRACE}.IDCUENTA
                FROM 
                    ${tableACP05}, ${tableACP030}, ${tableACP04}, ${tableACP02}, ${tableACP03}, ${tableACP09}
                LEFT JOIN 
                    ${tableBIOTRACE} 
                ON 
                    ${tableACP09}.NCTA09 = ${tableBIOTRACE}.NROCUENTA 
                WHERE 
                    ${tableACP05}.EMPR05 = '01' 
                    AND ${tableACP05}.NCTA05 = ? 
                    AND ${tableACP05}.AAUX05 = ${tableACP030}.AAUX03 
                    AND ${tableACP05}.NOMI05 = ${tableACP04}.NOMI04  
                    AND ${tableACP05}.DEPE05 = ${tableACP02}.DEPE02  
                    AND ${tableACP05}.ENTI05 = ${tableACP02}.ENTI02  
                    AND ${tableACP05}.DIST05 = ${tableACP03}.DIST03  
                    AND ${tableACP05}.NCTA05 = ${tableACP09}.NCTA09
            `;

            const result = await executeQuery(queryCuentaData, [cuenta]);

            //CREDITO ESPECIAL
            const cEspQuery = `
            SELECT SUM(SCAP13) AS Credito_Especial
            FROM ${tableACP13} 
            WHERE scap13 > 0 
            AND ncta13 = ? 
            AND EXISTS (
                SELECT * 
                FROM ${tableACP06} 
                WHERE tcre13 = tcre06 
                AND clas06 = 'E'
            )
        `;
            const vlrCredEsp = await executeQuery(cEspQuery, [cuenta]);

            //VALOR CUOTA CREDITO ESPECIAL
            const cEspCuoQuery = `
            SELECT SUM(INTI13) AS Cou_Cred_Esp
            FROM ${tableACP13} 
            WHERE scap13 > 0 
            AND ncta13 = ? 
            AND EXISTS (
                SELECT * 
                FROM ${tableACP06} 
                WHERE tcre13 = tcre06 
                AND clas06 = 'E'
            )
        `;
            const vlrCredCouEsp = await executeQuery(cEspCuoQuery, [cuenta]);


            //CREDITO ORDINARIO
            const cOrdQuery = `
            SELECT SUM(SCAP13) AS Credito_Ordinario
            FROM ${tableACP13} 
            WHERE scap13 > 0 
            AND ncta13 = ? 
            AND EXISTS (
                SELECT * 
                FROM ${tableACP06} 
                WHERE tcre13 = tcre06 
                AND clas06 = 'O'
            )
        `;
            const vlrCredOrd = await executeQuery(cOrdQuery, [cuenta]);

            //VALOR CUOTA CREDITO ORDINARIO
            const cOrdCuoQuery = `
            SELECT SUM(INTI13) AS Cou_Cred_Ord
            FROM ${tableACP13} 
            WHERE scap13 > 0 
            AND ncta13 = ? 
            AND EXISTS (
                SELECT * 
                FROM ${tableACP06} 
                WHERE tcre13 = tcre06 
                AND clas06 = 'O'
            )
        `;
            const vlrCredCouOrd = await executeQuery(cOrdCuoQuery, [cuenta]);

            // Ahora calculamos los valores comprometidos y vencidos 

            const creOrdQuery = `
                SELECT SUM(SCAP13) AS VRCOMORD 
                FROM ${tableACP13} 
                WHERE scap13 > 0 
                AND ncta13 = ? 
                AND EXISTS (
                    SELECT * 
                    FROM ${tableACP06} 
                    WHERE tcre13 = tcre06 
                    AND clas06 = 'O'
                )
            `;
            const vrCreOrd = await executeQuery(creOrdQuery, [cuenta]);
            const vrComOrd = Math.round(vrCreOrd[0].VRCOMORD);

            const creEspecialQuery = `
                SELECT SUM(SCAP13 / MONT13) AS VRCOMESP 
                FROM ${tableACP13} 
                WHERE scap13 > 0 
                AND ncta13 = ? 
                AND EXISTS (
                    SELECT * 
                    FROM ${tableACP06} 
                    WHERE tcre13 = tcre06 
                    AND clas06 = 'E'
                ) AND tcre13 != 60
            `;
            const vrCreEsp = await executeQuery(creEspecialQuery, [cuenta]);
            const vrComEsp = Math.round(vrCreEsp[0].VRCOMESP);

            const comprometido = vrComOrd + vrComEsp;

            // Ahora obtenemos los valores vencidos
            const fec = (new Date().getFullYear() - 1900).toString();
            const mes = (new Date().getMonth() + 1).toString().padStart(2, '0');
            const corte = fec + mes;

            const totalVenEspQuery = `
                SELECT SUM(CCAP14 + CINT14 + SIMO14 + SCJO14 + CICO14) AS VENESP 
                FROM ${tableACP14}, ${tableACP13} 
                WHERE EMPR13 = EMPR14 
                AND NCRE13 = NCRE14 
                AND VCTO14 < ? 
                AND NCTA14 = ? 
                AND NCTA14 = NCTA13 
                AND CCAP14 > 0 
                AND EXISTS (SELECT * FROM ${tableACP06} WHERE TCRE13 = TCRE06 AND CLAS06 = 'E')
            `;
            const totalVenEspResult = await executeQuery(totalVenEspQuery, [corte, cuenta]);
            const vrTotalEsp = totalVenEspResult[0].VENESP;

            const totalVenOrdQuery = `
                SELECT SUM(CCAP14 + CINT14 + SIMO14 + SCJO14 + CICO14) AS VENORD 
                FROM ${tableACP14}, ${tableACP13} 
                WHERE EMPR13 = EMPR14 
                AND NCRE13 = NCRE14 
                AND VCTO14 < ? 
                AND NCTA14 = ? 
                AND NCTA14 = NCTA13 
                AND CCAP14 > 0 
                AND EXISTS (SELECT * FROM ${tableACP06} WHERE TCRE13 = TCRE06 AND CLAS06 = 'O')
            `;
            const totalVenOrdResult = await executeQuery(totalVenOrdQuery, [corte, cuenta]);
            const vrTotalOrd = totalVenOrdResult[0].VENORD;

            // Obtención de la fecha de distribución de aportes
            const sqlFechaDistribucion = `
                SELECT CSAL09, FECH09 
                FROM ${tableACP09A} 
                WHERE ncta09 = ?
            `;
            const fechaDistribucion = await executeQuery(sqlFechaDistribucion, [cuenta]);

            let salo09 = 0;
            let fecha09 = null;
            if (fechaDistribucion.length > 0) {
                salo09 = fechaDistribucion[0].CSAL09;
                fecha09 = fechaDistribucion[0].FECH09;
            }

            // Total de deuda
            const deudaTotal = vrTotalEsp + vrTotalOrd + comprometido;

            const detallesCred = `
            SELECT 
            TCRE13, NCRE13, MOGA13, SCAP13, CCAP13, CINT13
            FROM ${tableACP13} 
            WHERE scap13 > 0 
            AND ncta13 = ? 
        `;
            const detallesCreditos = await executeQuery(detallesCred, [cuenta]);

            return {
                cuentaData: result,
                vlrCredEsp,
                vlrCredCouEsp,
                vlrCredOrd,
                vlrCredCouOrd,
                comprometido,
                deudaTotal,
                vrTotalEsp,
                vrTotalOrd,
                detallesCreditos,
                salo09,
                fecha09
            };

        } catch (error) {
            console.error('Error al obtener datos de la cuenta:', error);
            throw error;
        }
    }
};

module.exports = cuentaF6Model;
