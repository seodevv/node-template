const { promisePool } = require('../db');
const logger = require('../logger');

const selectBasicInfo = async ({ name, key }) => {
  let queryString = `
    SELECT
        bi.name,
        bi.key,
        bi.value
    FROM
        BASIC_INFO bi
    WHERE
        bi.name = ?
        AND bi.key = ?
    `;
  try {
    const [rows] = await promisePool.query(queryString, [name, key]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const selectOauth = async ({ id, type }) => {
  let queryString = `
    SELECT
      o.id,
      o.type,
      o.request_url,
      o.client_id,
      o.client_secret,
      o.grant_type,
      o.redirect_uri
    FROM
      OAUTH o
    WHERE
      o.id = ?
      AND o.type = ?
    `;
  try {
    const [rows] = await promisePool.query(queryString, [id, type]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const insertBasicInfo = async ({ name, key, value }) => {
  let selectString = `
    SELECT
        bi.name,
        bi.key,
        bi.value
    FROM
        BASIC_INFO bi
    WHERE
        bi.name = ?
        AND bl.key = ?
    `;
  //   logger.info(selectString);
  try {
    const [rows] = await promisePool.query(selectString, [name, key]);
    if (rows.length === 0) {
      let insertString = `
        INSERT INTO
            BASIC_INFO(\`name\`,\`key\`,\`value\`)
        VALUES (?, ?, ?)
        `;
      //   logger.info(insertString);
      await promisePool.query(insertString, [name, key, value]);
      return { result: true, message: 'inserted' };
    }

    if (rows[0].value !== value) {
      let updateString = `
        UPDATE
            BASIC_INFO
        SET
            value = ?
        WHERE
            name = ?
            AND key = ?
        `;
      await promisePool.query(updateString, [value, name, key]);
      return { result: true, message: 'updated' };
    }
    return { result: true, message: 'nothing to do' };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  selectBasicInfo,
  selectOauth,
  insertBasicInfo,
};
