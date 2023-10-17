const { promisePool } = require('../db');
const logger = require('../logger');

const selectProductType = async () => {
  let queryString = `
  SELECT
    pt.id,
    pt.type,
    pt.image
  FROM
    PRODUCT_TYPE pt
  `;
  // logger.info(queryString);
  try {
    const [rows] = await promisePool.query(queryString);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectProductSubject = async ({ main = false }) => {
  let queryString = `
  SELECT
    ps.id,
    ps.type,
    ps.subject,
    ps.show_main,
    ps.image
  FROM
    PRODUCT_SUBJECT ps
  `;

  if (main) {
    queryString += `
  WHERE 
    show_main IS TRUE
    `;
  }
  // logger.info(queryString);
  try {
    const [rows] = await promisePool.query(queryString);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectProductList = async ({ type = 'recent', limit = 12 }) => {
  let queryString = `
  SELECT 
    pl.id,
    pl.subject,
    ps.subject AS subjectName,
    pl.name,
    pl.price,
    pl.image,
    pl.size,
    pl.order,
    pl.regist,
    pl.sell
  FROM 
    PRODUCT_LIST pl
  INNER JOIN
    PRODUCT_SUBJECT ps
    ON ps.id = pl.subject
  `;

  switch (type) {
    case 'recent':
      queryString += `ORDER BY 
    pl.regist DESC
  `;
      break;
    case 'main':
      queryString += `WHERE
    ps.show_main IS TRUE
  ORDER BY 
    pl.order
  `;
      break;
    case 'popular':
      queryString += `ORDER BY 
    pl.sell DESC
  `;
      break;
  }

  queryString += `LIMIT ${limit}
  `;
  // logger.info(queryString);
  try {
    const [rows] = await promisePool.query(queryString);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  selectProductType,
  selectProductSubject,
  selectProductList,
};
