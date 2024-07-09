const mysql = require('mysql2/promise');

const createMySQLConnection = async (config) => {
  return await mysql.createConnection(config);
};

module.exports = {
  createMySQLConnection,
};
