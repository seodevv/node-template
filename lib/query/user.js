const { promisePool } = require('../db');

const selectUser = async ({ id, type, password, email }) => {
  let queryString = `
    SELECT
        u.id,
        u.type,
        u.email,
        ${password ? 'u.password,' : ''}
        u.nick,
        u.phone,
        u.address,
        u.picture,
        u.regist
    FROM
        USER u
    WHERE
        1 = 1
    `;
  if (id) {
    queryString += `
        AND u.id = "${id}"
        `;
  }
  if (type) {
    queryString += `
        AND u.type = "${type}"
        `;
  }
  if (email) {
    queryString += `
        AND u.email = "${email}"
        `;
  }
  try {
    const [rows] = await promisePool.query(queryString);
    return rows;
  } catch (error) {
    throw error;
  }
};

const insertUser = async ({
  type = 'app',
  email,
  password = null,
  nick,
  picture,
}) => {
  try {
    const [exist] = await selectUser({ type, email });
    if (!exist) {
      let insertString = `
        INSERT INTO USER(type, email, password, nick, picture) VALUES (?, ?, ?, ?, ?)`;
      const [{ insertId }] = await promisePool.query(insertString, [
        type,
        email,
        password,
        nick,
        picture,
      ]);
      const [data] = await selectUser({ id: insertId });
      return data;
    }
    return exist;
  } catch (error) {
    throw error;
  }
};

module.exports = { selectUser, insertUser };
