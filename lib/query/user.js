const promisePool = require('../db');
const { getKoreaDate } = require('../common');

const selectAllUsers = async () => {
  let queryString = 'SELECT * FROM user ';
  try {
    const [rows] = await promisePool.query(queryString);
    const result = rows.map((row) => ({
      ...row,
      birth: getKoreaDate(row.birth),
      regist: getKoreaDate(row.regist),
      login: row.login ? getKoreaDate(row.login) : null,
    }));
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  selectAllUsers,
};
