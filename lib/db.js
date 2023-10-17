const mysql = require('mysql2');
const logger = require('./logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_INSTANCE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 50,
  dateStrings: 'date',
});

const promisePool = pool.promise();

const dbConnectionTest = async () => {
  let selectQuery = 'SELECT 1 FROM DUAL';
  const [rows] = await promisePool.query(selectQuery);
  logger.info(
    `[${process.env.DB_INSTANCE}][${process.env.DB_HOST}:${process.env.DB_PORT}] DB Connection Success`
  );
  return rows;
};

module.exports = { promisePool, dbConnectionTest };
