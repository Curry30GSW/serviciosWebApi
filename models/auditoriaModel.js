const db = require('../config/mysqlConnection');

const listarAuditoria = async () => {
    const query = 'SELECT * FROM auditoria_web';
    const [rows] = await db.query(query);
    return rows;
};

module.exports = {
    listarAuditoria
};
