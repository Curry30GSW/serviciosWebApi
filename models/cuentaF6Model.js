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
                        ${tableACP05}.DESC05,
                        ${tableACP05}.FEVI05, 
                        ${tableACP05}.NOMI05, 
                        ${tableACP05}.ENTI05, 
                        ${tableACP05}.DEPE05, 
                        ${tableACP05}.AAUX05,
                        ${tableACP05}.NNIT05,
                        ${tableACP030}.DESC03 AS DCARTERA, 
                        ${tableACP04}.DESC04, 
                        ${tableACP02}.DESC02, 
                        ${tableACP03}.DESC03 AS AGENCIA, 
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
            // CREDITO ESPECIAL
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
            const vlrCredEspResult = await executeQuery(cEspQuery, [cuenta]);
            const vlrCredEsp = vlrCredEspResult[0]?.CREDITO_ESPECIAL ?? 0;


            // VALOR CUOTA CREDITO ESPECIAL
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
            const vlrCredCouEspResult = await executeQuery(cEspCuoQuery, [cuenta]);
            const vlrCredCouEsp = vlrCredCouEspResult[0]?.COU_CRED_ESP ?? 0;


            // CREDITO ORDINARIO
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
            const vlrCredOrdResult = await executeQuery(cOrdQuery, [cuenta]);
            const vlrCredOrd = vlrCredOrdResult[0]?.CREDITO_ORDINARIO ?? 0;

            // VALOR CUOTA CREDITO ORDINARIO
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
            const vlrCredCouOrdResult = await executeQuery(cOrdCuoQuery, [cuenta]);
            const vlrCredCouOrd = vlrCredCouOrdResult[0]?.COU_CRED_ORD ?? 0;
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
            // Comprometido y CUPO
            const asal09 = Number(result[0]?.ASAL09 ?? 0);
            const comprometido = vrComOrd + vrComEsp;
            const cupo = Math.round((asal09 * 0.95) - comprometido);

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
            const vrTotalEsp = totalVenEspResult[0]?.VENESP ?? 0;

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
            const vrTotalOrd = totalVenOrdResult[0]?.VENORD ?? 0;


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
            const intVencidosQuery = `
                SELECT SUM(CINT14 + SIMO14 + SCJO14 + CICO14) AS IntVencidos
                FROM ${tableACP14}
                WHERE NCTA14 = ?
                AND CCAP14 > 0
                AND VCTO14 <= ?
            `;

            const intVencidosResult = await executeQuery(intVencidosQuery, [cuenta, corte]);
            const intVencidos = intVencidosResult[0]?.INTVENCIDOS ?? 0;

            // Total de deuda
            const deudaTotal = intVencidos + vlrCredEsp + vlrCredOrd;

            // Consulta para obtener los créditos
            const detallesCred = `
             SELECT 
             "TCRE13", "NCRE13", "MOGA13", "SCAP13", "CCAP13", "CINT13"
             FROM COLIB.ACP13 
             WHERE "SCAP13" > 0 
             AND "NCTA13" = ? 
         `;

            // Ejecutar consulta
            const detallesCreditos = await executeQuery(detallesCred, [cuenta]);

            // Inicializar arrays para almacenar datos
            const trec = [];
            const ncre = [];
            const moga = [];
            const scap = [];
            const vencidos = [];
            const cuotasCapital = [];
            const cuotasInteres = [];
            const cuotasTotales = [];

            // Iterar sobre cada registro y almacenar los valores
            for (let i = 0; i < detallesCreditos.length; i++) {
                const registro = detallesCreditos[i];
                trec.push(registro.TCRE13);
                ncre.push(registro.NCRE13);
                moga.push(registro.MOGA13);
                scap.push(registro.SCAP13);

                // Consulta para obtener SALDOVDO (Vencido)
                const vencidoQuery = `
                 SELECT SUM(ACP14.CCAP14 + ACP14.CINT14 + ACP14.SIMO14 + ACP14.SCJO14 + CICO14) AS SALDOVDO
                 FROM COLIB.ACP13 ACP13, COLIB.ACP14 ACP14
                 WHERE ACP14.EMPR14 = ACP13.EMPR13 
                 AND ACP14.NCTA14 = ACP13.NCTA13 
                 AND ACP14.NCRE14 = ACP13.NCRE13 
                 AND ACP14.NCTA14 = ? 
                 AND ACP14.NCRE14 = ? 
                 AND (CCAP14 + CINT14 + SIMO14 + SCJO14 > 0)
                 AND ACP14.VCTO14 < ?
             `;
                const vencidoResult = await executeQuery(vencidoQuery, [cuenta, ncre[i], corte]);
                vencidos.push(vencidoResult[0]?.SALDOVDO ?? 0);

                // Consulta para obtener Cuota Capital
                const cuotaCapitalQuery = `
                 SELECT CCAP14 
                 FROM COLIB.ACP13 ACP13, COLIB.ACP14 ACP14
                 WHERE ACP14.EMPR14 = ACP13.EMPR13 
                 AND ACP14.NCTA14 = ACP13.NCTA13 
                 AND ACP14.NCRE14 = ACP13.NCRE13 
                 AND ACP14.NCTA14 = ? 
                 AND ACP14.NCRE14 = ? 
                 AND (CCAP14 + CINT14 + SIMO14 + SCJO14 > 0)
                 AND ACP14.VCTO14 = ?
             `;
                const cuotaCapitalResult = await executeQuery(cuotaCapitalQuery, [cuenta, ncre[i], corte]);
                cuotasCapital.push(cuotaCapitalResult[0]?.CCAP14 ?? 0);

                // Consulta para obtener Cuota Interés
                const cuotaInteresQuery = `
                 SELECT (CINT14 + SIMO14 + SCJO14) AS CINTERES 
                 FROM COLIB.ACP14 
                 WHERE NCTA14 = ? 
                 AND NCRE14 = ? 
                 AND CCAP14 > 0  
                 AND VCTO14 = ?
             `;
                const cuotaInteresResult = await executeQuery(cuotaInteresQuery, [cuenta, ncre[i], corte]);
                cuotasInteres.push(cuotaInteresResult[0]?.CINTERES ?? 0);

                // Consulta para obtener Cuota Total
                const valorCuotaQuery = `
                 SELECT INTI13 AS CUOTA 
                 FROM COLIB.ACP13 
                 WHERE NCTA13 = ? 
                 AND NCRE13 = ?
             `;
                const valorCuotaResult = await executeQuery(valorCuotaQuery, [cuenta, ncre[i]]);
                cuotasTotales.push(valorCuotaResult[0]?.CUOTA ?? 0);
            }

            return {
                cuentaData: result,
                vlrCredEsp,
                vlrCredCouEsp,
                vlrCredOrd,
                vlrCredCouOrd,
                comprometido,
                cupo: cupo,
                deudaTotal,
                intVencidos,
                vrTotalEsp,
                vrTotalOrd,
                detallesCreditos,
                vencidos,
                cuotasTotales,
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
