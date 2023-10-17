const { promisePool } = require('../db');
const logger = require('../logger');

const selectEmailInfo = async () => {
  let queryString = `
  SELECT
    e.id,
    e.password
  FROM
    EMAIL e
  `;

  try {
    const [rows] = await promisePool.query(queryString);
    return rows;
  } catch (error) {
    throw error;
  }
};

const insertEmailInfo = async ({ id, password }) => {
  try {
    const rows = await selectEmailInfo();
    if (rows.length === 0) {
      let insertString = `
      INSERT INTO EMAIL VALUES (?, ?)
      `;
      await promisePool.query(insertString, [id, password]);
      return { result: true, message: 'inserted' };
    }

    let updateString = `
    UPDATE
      EMAIL e
    SET
      e.id = ?,
      e.password = ?
    `;
    await promisePool.query(updateString, [id, password]);
    return { result: true, message: 'updated' };
  } catch (error) {
    throw error;
  }
};

const insertEmailSubscribe = async (email) => {
  let selectString = `
  SELECT
    s.email
  FROM
    SUBSCRIBE s
  WHERE
    s.email = ?
  `;
  try {
    const [rows] = await promisePool.query(selectString, [email]);
    if (rows.length === 0) {
      let insertString = `INSERT INTO SUBSCRIBE VALUES(?)`;
      await promisePool.query(insertString, [email]);
      return { result: true, message: 'inserted' };
    }
    return { result: true, message: 'nothing to do' };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  selectEmailInfo,
  insertEmailInfo,
  insertEmailSubscribe,
};
