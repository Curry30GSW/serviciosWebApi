require('dotenv').config();
const odbc = require('odbc');

const connectionString = `DSN=${process.env.ODBC_DSN};UID=${process.env.ODBC_USER};PWD=${process.env.ODBC_PASSWORD};CCSID=1208`;


let connection;

const connectToDatabase = async () => {
  try {
    if (!connection) {
      connection = await odbc.connect(connectionString);
      console.log('Conexión establecida con AS400');
    }
    return connection;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
};

const executeQuery = async (query, params = []) => {
  try {
    const conn = await connectToDatabase();
    const result = await conn.query(query, params);
    return result;
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    throw error;
  }
};

module.exports = {
  executeQuery,
  connectToDatabase
};
