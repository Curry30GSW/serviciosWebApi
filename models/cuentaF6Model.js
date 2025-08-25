const { executeQuery } = require('../config/db');

const cuentaF6Model = {
    async getCuentaData(cuenta) {
        try {
            // Consulta de los datos de la cuenta
            const queryCuentaData = `
                SELECT 
                    ACP05.DIST05, 
                    ACP05.DESC05,
                    ACP05.FEVI05, 
                    ACP05.NOMI05, 
                    ACP05.ENTI05, 
                    ACP05.DEPE05, 
                    ACP05.AAUX05,
                    ACP05.NNIT05,
                    ACP030.DESC03 AS DCARTERA, 
                    ACP04.DESC04, 
                    ACP02.DESC02, 
                    ACP03.DESC03 AS AGENCIA, 
                    ACP09.ASAL09, 
                    ACP09.ACUO09, 
                    ACP09.DSAL09, 
                    CUENTAS.IDCUENTA
                FROM COLIB.ACP05 ACP05,
                     COLIB.ACP030 ACP030,
                     COLIB.ACP04 ACP04,
                     COLIB.ACP02 ACP02,
                     COLIB.ACP03 ACP03,
                     COLIB.ACP09 ACP09
                LEFT JOIN BIOTRACE.CUENTAS CUENTAS 
                       ON ACP09.NCTA09 = CUENTAS.NROCUENTA 
                WHERE ACP05.EMPR05 = '01' 
                  AND ACP05.NCTA05 = ? 
                  AND ACP05.AAUX05 = ACP030.AAUX03 
                  AND ACP05.NOMI05 = ACP04.NOMI04  
                  AND ACP05.DEPE05 = ACP02.DEPE02  
                  AND ACP05.ENTI05 = ACP02.ENTI02  
                  AND ACP05.DIST05 = ACP03.DIST03  
                  AND ACP05.NCTA05 = ACP09.NCTA09
            `;

            const result = await executeQuery(queryCuentaData, [cuenta]);


            // CREDITO ESPECIAL
            const cEspQuery = `
                SELECT SUM(SCAP13) AS Credito_Especial
                FROM COLIB.ACP13 
                WHERE scap13 > 0 
                  AND ncta13 = ? 
                  AND EXISTS (
                        SELECT * 
                        FROM COLIB.ACP06 
                        WHERE tcre13 = tcre06 
                          AND clas06 = 'E'
                  )
            `;
            const vlrCredEspResult = await executeQuery(cEspQuery, [cuenta]);
            const vlrCredEsp = vlrCredEspResult[0]?.CREDITO_ESPECIAL ?? 0;

            // VALOR CUOTA CREDITO ESPECIAL
            const cEspCuoQuery = `
                SELECT SUM(INTI13) AS Cou_Cred_Esp
                FROM COLIB.ACP13 
                WHERE scap13 > 0 
                  AND ncta13 = ? 
                  AND EXISTS (
                        SELECT * 
                        FROM COLIB.ACP06 
                        WHERE tcre13 = tcre06 
                          AND clas06 = 'E'
                  )
            `;
            const vlrCredCouEspResult = await executeQuery(cEspCuoQuery, [cuenta]);
            const vlrCredCouEsp = vlrCredCouEspResult[0]?.COU_CRED_ESP ?? 0;

            // CREDITO ORDINARIO
            const cOrdQuery = `
                SELECT SUM(SCAP13) AS Credito_Ordinario
                FROM COLIB.ACP13 
                WHERE scap13 > 0 
                  AND ncta13 = ? 
                  AND EXISTS (
                        SELECT * 
                        FROM COLIB.ACP06 
                        WHERE tcre13 = tcre06 
                          AND clas06 = 'O'
                  )
            `;
            const vlrCredOrdResult = await executeQuery(cOrdQuery, [cuenta]);
            const vlrCredOrd = vlrCredOrdResult[0]?.CREDITO_ORDINARIO ?? 0;

            // VALOR CUOTA CREDITO ORDINARIO
            const cOrdCuoQuery = `
                SELECT SUM(INTI13) AS Cou_Cred_Ord
                FROM COLIB.ACP13 
                WHERE scap13 > 0 
                  AND ncta13 = ? 
                  AND EXISTS (
                        SELECT * 
                        FROM COLIB.ACP06 
                        WHERE tcre13 = tcre06 
                          AND clas06 = 'O'
                  )
            `;
            const vlrCredCouOrdResult = await executeQuery(cOrdCuoQuery, [cuenta]);
            const vlrCredCouOrd = vlrCredCouOrdResult[0]?.COU_CRED_ORD ?? 0;

            // COMPROMETIDOS
            const creOrdQuery = `
                SELECT SUM(SCAP13) AS VRCOMORD 
                FROM COLIB.ACP13 
                WHERE scap13 > 0 
                  AND ncta13 = ? 
                  AND EXISTS (
                        SELECT * 
                        FROM COLIB.ACP06 
                        WHERE tcre13 = tcre06 
                          AND clas06 = 'O'
                  )
            `;
            const vrCreOrd = await executeQuery(creOrdQuery, [cuenta]);
            const vrComOrd = Math.round(vrCreOrd[0].VRCOMORD);

            const creEspecialQuery = `
                SELECT SUM(SCAP13 / MONT13) AS VRCOMESP 
                FROM COLIB.ACP13 
                WHERE scap13 > 0 
                  AND ncta13 = ? 
                  AND EXISTS (
                        SELECT * 
                        FROM COLIB.ACP06 
                        WHERE tcre13 = tcre06 
                          AND clas06 = 'E'
                  ) AND tcre13 != 60
            `;
            const vrCreEsp = await executeQuery(creEspecialQuery, [cuenta]);
            const vrComEsp = Math.round(vrCreEsp[0].VRCOMESP);

            const asal09 = Number(result[0]?.ASAL09 ?? 0);
            const comprometido = vrComOrd + vrComEsp;
            const cupo = Math.round((asal09 * 0.95) - comprometido);

            // FECHA CORTE
            const fec = (new Date().getFullYear() - 1900).toString();
            const mes = (new Date().getMonth() + 1).toString().padStart(2, '0');
            const corte = fec + mes;

            // VENCIDOS
            const totalVenEspQuery = `
                SELECT SUM(CCAP14 + CINT14 + SIMO14 + SCJO14 + CICO14) AS VENESP 
                FROM COLIB.ACP14, COLIB.ACP13 
                WHERE EMPR13 = EMPR14 
                  AND NCRE13 = NCRE14 
                  AND VCTO14 < ? 
                  AND NCTA14 = ? 
                  AND NCTA14 = NCTA13 
                  AND CCAP14 > 0 
                  AND EXISTS (SELECT * FROM COLIB.ACP06 WHERE TCRE13 = TCRE06 AND CLAS06 = 'E')
            `;
            const totalVenEspResult = await executeQuery(totalVenEspQuery, [corte, cuenta]);
            const vrTotalEsp = totalVenEspResult[0]?.VENESP ?? 0;

            const totalVenOrdQuery = `
                SELECT SUM(CCAP14 + CINT14 + SIMO14 + SCJO14 + CICO14) AS VENORD 
                FROM COLIB.ACP14, COLIB.ACP13 
                WHERE EMPR13 = EMPR14 
                  AND NCRE13 = NCRE14 
                  AND VCTO14 < ? 
                  AND NCTA14 = ? 
                  AND NCTA14 = NCTA13 
                  AND CCAP14 > 0 
                  AND EXISTS (SELECT * FROM COLIB.ACP06 WHERE TCRE13 = TCRE06 AND CLAS06 = 'O')
            `;
            const totalVenOrdResult = await executeQuery(totalVenOrdQuery, [corte, cuenta]);
            const vrTotalOrd = totalVenOrdResult[0]?.VENORD ?? 0;

            // FECHA DISTRIBUCION
            const sqlFechaDistribucion = `
                SELECT CSAL09, FECH09 
                FROM COLIB.ACP09A 
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
                FROM COLIB.ACP14
                WHERE NCTA14 = ?
                  AND CCAP14 > 0
                  AND VCTO14 <= ?
            `;
            const intVencidosResult = await executeQuery(intVencidosQuery, [cuenta, corte]);
            const intVencidos = intVencidosResult[0]?.INTVENCIDOS ?? 0;

            const deudaTotal = intVencidos + vlrCredEsp + vlrCredOrd;

            // DETALLES CREDITOS
            const detallesCred = `
                SELECT TCRE13, NCRE13, MOGA13, SCAP13, CCAP13, CINT13
                FROM COLIB.ACP13 
                WHERE SCAP13 > 0 
                  AND NCTA13 = ? 
            `;
            const detallesCreditos = await executeQuery(detallesCred, [cuenta]);

            // Arrays de resultados
            const vencidos = [];
            const cuotasCapital = [];
            const cuotasInteres = [];
            const cuotasTotales = [];

            for (let i = 0; i < detallesCreditos.length; i++) {
                const registro = detallesCreditos[i];

                // Vencido
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
                const vencidoResult = await executeQuery(vencidoQuery, [cuenta, registro.NCRE13, corte]);
                vencidos.push(vencidoResult[0]?.SALDOVDO ?? 0);

                // Cuota Capital
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
                const cuotaCapitalResult = await executeQuery(cuotaCapitalQuery, [cuenta, registro.NCRE13, corte]);
                cuotasCapital.push(cuotaCapitalResult[0]?.CCAP14 ?? 0);

                // Cuota Interés
                const cuotaInteresQuery = `
                    SELECT (CINT14 + SIMO14 + SCJO14) AS CINTERES 
                    FROM COLIB.ACP14 
                    WHERE NCTA14 = ? 
                      AND NCRE14 = ? 
                      AND CCAP14 > 0  
                      AND VCTO14 = ?
                `;
                const cuotaInteresResult = await executeQuery(cuotaInteresQuery, [cuenta, registro.NCRE13, corte]);
                cuotasInteres.push(cuotaInteresResult[0]?.CINTERES ?? 0);

                // Cuota Total
                const valorCuotaQuery = `
                    SELECT INTI13 AS CUOTA 
                    FROM COLIB.ACP13 
                    WHERE NCTA13 = ? 
                      AND NCRE13 = ?
                `;
                const valorCuotaResult = await executeQuery(valorCuotaQuery, [cuenta, registro.NCRE13]);
                cuotasTotales.push(valorCuotaResult[0]?.CUOTA ?? 0);
            }

            return {
                cuentaData: result,
                vlrCredEsp,
                vlrCredCouEsp,
                vlrCredOrd,
                vlrCredCouOrd,
                comprometido,
                cupo,
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
