const pool = require('../config/mysqlConnection');

async function registrarAuditoria(usuario, ip, accion) {
    const query = `INSERT INTO auditoria_Web (asociado, ip_web, evento, fecha) VALUES (?, ?, ?, NOW())`;
    await pool.execute(query, [usuario, ip, accion]);
}

module.exports = {
    registrarAuditoria
};
