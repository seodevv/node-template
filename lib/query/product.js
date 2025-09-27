const { promisePool } = require('../db');
const logger = require('../logger');

const selectProductBanner = async ({ name }) => {
  let queryString = `
  SELECT
    b.id,
    b.banner,
    b.image
  FROM
    BANNER b
  WHERE
    b.banner = ?
  `;
  try {
    const [rows] = await promisePool.query(queryString, [name]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectProductBrands = async ({ category, brand }) => {
  let queryString = `
  SELECT
    b.id,
    c.category,
    b.brand,
    b.logo,
    b.image,
    b.desc
  FROM
    BRANDS b
  INNER JOIN BRANDS_CATEGORY bc
    ON bc.brand = b.id
  INNER JOIN CATEGORY c
    ON c.id = bc.category
  WHERE
    1 = 1\n`;
  queryString += category ? '    AND c.category = ?\n' : '';
  queryString += brand ? '    AND b.brand = ?\n' : '';

  queryString += '  GROUP BY\n';
  queryString += '    b.brand\n';
  queryString += '  ORDER BY\n';
  queryString += '    b.brand\n';

  // logger.info(queryString);
  try {
    const params = [];
    if (category) params.push(category);
    if (brand) params.push(brand);

    const [rows] = await promisePool.query(queryString, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectProductCategories = async ({ category }) => {
  let queryString = `
  SELECT
    ps.id,
    c.category,
    pt.type,
    ps.subject,
    ps.order
  FROM
    CATEGORY c
  INNER JOIN PRODUCT_TYPE pt
    ON pt.category = c.id
  INNER JOIN PRODUCT_SUBJECT ps
    ON ps.type = pt.id
  WHERE
    c.category = ?
  ORDER BY
    pt.id,
    ps.order
  `;
  try {
    const [rows] = await promisePool.query(queryString, [category]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectProductType = async ({ banner = false }) => {
  let queryString = `
  SELECT
    pt.id,
    c.category,
    pt.type ${banner ? 'as banner' : ''},
    pt.image
  FROM
    PRODUCT_TYPE pt
  INNER JOIN CATEGORY c
    ON c.id = pt.category
  `;
  // logger.info(queryString);
  try {
    const [rows] = await promisePool.query(queryString);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectProductSubject = async ({ main = false, banner = false, name }) => {
  let queryString = `
  SELECT
    ps.id,
    c.category,
    pt.type,
    ps.subject ${banner ? 'as banner' : ''},
    ps.show_main,
    ps.image,
    ps.order
  FROM
    PRODUCT_SUBJECT ps
  INNER JOIN PRODUCT_TYPE pt
    ON pt.id = ps.type
  INNER JOIN CATEGORY c
    ON c.id = pt.category
  WHERE
    1 = 1    
  `;

  if (main) {
    queryString += '  AND show_main IS TRUE\n';
  }

  if (name) {
    queryString += '  AND ps.subject = ?';
  }

  queryString += '  ORDER BY\n';
  queryString += '    ps.type, ps.order';

  // logger.info(queryString);

  try {
    let params = [];
    if (name) params.push(name);
    const [rows] = await promisePool.query(queryString, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectProductList = async ({
  order = 'recent',
  limit = 12,
  brand,
  price,
  size,
  category,
  type,
  subjects,
}) => {
  let queryString = `
  SELECT 
    pl.id,
    ps.subject AS subjectName,
    b.brand as brandName,
    pl.name,
    pl.desc,
    pl.price,
    pl.image,
    pl.order,
    pl.regist,
    pl.sell
  FROM 
    PRODUCT_LIST pl
  INNER JOIN PRODUCT_SUBJECT ps
    ON ps.id = pl.subject
  INNER JOIN PRODUCT_TYPE pt
    ON pt.id = ps.type
    ${
      category
        ? `INNER JOIN 
		(SELECT 
			id, 
			category 
		FROM 
			CATEGORY 
		WHERE 
			category = ?) c
		ON c.id = pt.category`
        : ''
    }
  INNER JOIN
    BRANDS b
      ON b.id = pl.brand
  ${
    size
      ? `INNER JOIN
    (SELECT
        id
      FROM
        PRODUCT_SIZE
      WHERE
        size IN (${size})
      GROUP BY
        id) s
      ON s.id = pl.id`
      : ''
  }
  WHERE
    1 = 1
  `;

  if (brand && brand !== 'all') {
    queryString += '  AND b.brand = ?\n';
  }

  if (price) {
    queryString += '  AND pl.price <= ?\n';
  }

  if (type) {
    queryString += '  AND pt.type = ?\n';
  }

  if (subjects) {
    queryString += '  AND ps.subject IN (';
    queryString += subjects.split(',').map(() => '?');
    queryString += ')\n';
  }

  switch (order) {
    case 'main':
      queryString += '    AND ps.show_main IS TRUE\n';
      queryString += '  ORDER BY\n';
      queryString += '    pl.regist DESC\n';
      break;
    case 'all':
    case 'new':
      queryString += '  ORDER BY\n';
      queryString += '    pl.regist DESC\n';
      break;
    case 'popular':
      queryString += '  ORDER BY\n';
      queryString += '    pl.sell DESC\n';
      break;
    case 'priceAsc':
      queryString += '  ORDER BY\n';
      queryString += '    pl.price ASC\n';
      break;
    case 'priceDesc':
      queryString += '  ORDER BY\n';
      queryString += '    pl.price DESC\n';
      break;
    case 'nameAsc':
      queryString += '  ORDER BY\n';
      queryString += '    pl.name ASC\n';
      break;
    case 'nameDesc':
      queryString += '  ORDER BY\n';
      queryString += '    pl.name DESC\n';
      break;
  }
  queryString += '  LIMIT ?';
  // logger.info(queryString);
  try {
    let params = [];
    if (category) params.push(category);
    if (brand && brand !== 'all') params.push(brand);
    if (price) params.push(Number(price));
    if (type) params.push(type);
    if (subjects) params = params.concat(subjects.split(','));
    params.push(Number(limit));

    const [rows] = await promisePool.query(queryString, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectProductListById = async ({ id }) => {
  let queryString = `
  SELECT 
    pl.id,
    ps.subject AS subjectName,
    b.brand as brandName,
    b.logo as brandLogo,
    pl.name,
    pl.desc,
    pl.price,
    pl.image,
    pl.order,
    pl.regist,
    pl.sell
  FROM 
    PRODUCT_LIST pl
  INNER JOIN PRODUCT_SUBJECT ps
    ON ps.id = pl.subject
  INNER JOIN BRANDS b
    ON b.id = pl.brand
  WHERE
    pl.id = ?
  `;
  try {
    const [rows] = await promisePool.query(queryString, [id]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const selectProductNavigator = async ({ id }) => {
  let queryString = `
  SELECT
    pl.id,
    c.category,
    pt.type,
    ps.subject,
    pl.name
  FROM
    PRODUCT_TYPE pt
  INNER JOIN PRODUCT_SUBJECT ps
    ON ps.type = pt.id
  INNER JOIN CATEGORY c
    ON c.id = pt.category
  INNER JOIN PRODUCT_LIST pl
    ON pl.subject = ps.id
  WHERE
    pl.id = ${id}
  `;
  try {
    const [rows] = await promisePool.query(queryString, [id]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const selectProductSize = async ({ id }) => {
  let queryString = `
  SELECT
    ps.id,
    s.id as sizeId,
    s.size,
    ps.quantity
  FROM
    PRODUCT_SIZE ps
  INNER JOIN SIZES s
      ON s.id = ps.size
  WHERE
    ps.id = ?
  ORDER BY
    s.order
  `;
  try {
    const [rows] = await promisePool.query(queryString, [id]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectProductDetail = async ({ id }) => {
  let queryString = `
  SELECT
    pd.id,
    pd.detail,
    d.text
  FROM
    PRODUCT_DETAIL pd
  INNER JOIN DETAIL d
      ON d.id = pd.detail
  WHERE
    pd.id = ?
  `;
  try {
    const [rows] = await promisePool.query(queryString, [id]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectWish = async ({ userId, listId }) => {
  let queryString = `
  SELECT
    w.userId,
    pl.id,
    pl.name,
    pl.desc,
    pl.price,
    pl.image,
    pl.order,
    pl.regist,
    pl.sell
  FROM 
    wish w
  INNER JOIN
    product_list pl
    ON pl.id = w.listId
  WHERE
    1 = 1
  `;

  if (userId) {
    queryString += '    AND userId = ?\n';
  }
  if (listId) {
    queryString += '    AND listId = ?\n';
  }

  try {
    let params = [];
    if (userId) params.push(userId);
    if (listId) params.push(listId);
    const [rows] = await promisePool.query(queryString, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectCartItems = async ({ user, ids }) => {
  let queryString = `
  SELECT
    c.id,
    c.user as userId,
    pl.id as productId,
    pl.name,
    pl.price,
    pl.image,
    c.size as sizeId,
    s.size,
    c.quantity
  FROM
    CART c
  INNER JOIN PRODUCT_LIST pl
    ON pl.id = c.product
  INNER JOIN SIZES s
    ON s.id = c.size
  WHERE
    1 = 1
  `;

  if (user) {
    queryString += '    AND c.user = ?\n';
  }
  if (ids) {
    queryString += `    and c.id IN (${ids})\n`;
  }

  queryString += '  ORDER BY\n';
  queryString += '  c.id\n';
  try {
    let params = [];
    if (user) params.push(user);
    if (ids) params.push(ids);
    const [rows] = await promisePool.query(queryString, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectContact = async ({ key }) => {
  let queryString = `
  SELECT
    c.id,
    c.key,
    c.value
  FROM
    CONTACT c
  `;
  if (key) {
    queryString += 'WHERE\n';
    queryString += `    c.key IN (${key.split(',').map(() => '?')})\n`;
  }

  try {
    let params = [];
    if (key) params = params.concat(key.split(','));

    const [rows] = await promisePool.query(queryString, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectSizeGroup = async () => {
  let queryString = `
  SELECT
    s.id,
    s.size,
    s.order
  FROM
    SIZES s
  ORDER BY
    s.order; 
  `;
  try {
    const [rows] = await promisePool.query(queryString);
    return rows;
  } catch (error) {
    throw error;
  }
};

const insertWish = async ({ userId, listId }) => {
  try {
    const exist = await selectWish({ userId, listId });
    if (exist.length !== 0) {
      const deleteString = `DELETE FROM WISH WHERE userId = ? AND listId = ?`;
      await promisePool.query(deleteString, [userId, listId]);
      return { result: true, message: 'deleted' };
    }

    const insertString = `INSERT INTO WISH VALUES(?, ?)`;
    await promisePool.query(insertString, [userId, listId]);
    return { result: true, message: 'inserted' };
  } catch (error) {
    throw error;
  }
};

const insertCart = async ({ user, product, size, quantity }) => {
  let selectString = `
  SELECT
    c.user,
    c.product,
    c.size,
    c.quantity
  FROM
    CART c
  WHERE
    c.user = ?
    AND c.product = ?
    AND c.size = ?
  `;

  try {
    const [exist] = await promisePool.query(selectString, [
      user,
      product,
      size,
    ]);
    if (exist.length === 0) {
      let insertString =
        'INSERT INTO CART(`user`,`product`,`size`,`quantity`) VALUES (?, ?, ?, ?)';
      await promisePool.query(insertString, [user, product, size, quantity]);
    } else {
      let updateString = `
      UPDATE
        CART c
      SET
        c.quantity = c.quantity + 1
      WHERE
        c.user = ?
        AND c.product = ?
        AND c.size = ?
      `;
      await promisePool.query(updateString, [user, product, size]);
    }
    return true;
  } catch (error) {
    throw error;
  }
};

const insertEnquire = async ({ first, last, email, phone, message }) => {
  let queryString = `
  INSERT INTO 
    ENQUIRE(firstname, lastname, email, phone, message)
  VALUES 
    (?, ?, ?, ?, ?)
  `;
  try {
    await promisePool.query(queryString, [first, last, email, phone, message]);
    return true;
  } catch (error) {
    throw error;
  }
};

const updateCart = async ({ type, user, product, size }) => {
  let queryString = 'UPDATE CART c SET c.quantity = ';

  queryString += type === 'increase' ? 'c.quantity + 1 ' : 'c.quantity - 1 ';
  queryString += 'WHERE user = ? AND product = ? AND size = ?';

  try {
    await promisePool.query(queryString, [user, product, size]);
    return true;
  } catch (error) {
    throw error;
  }
};

const deleteCart = async ({ user, product, size }) => {
  let queryString =
    'DELETE FROM CART WHERE `user`= ? AND `product` = ? AND `size` = ?';
  try {
    await promisePool.query(queryString, [user, product, size]);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  selectProductBanner,
  selectProductBrands,
  selectProductCategories,
  selectProductType,
  selectProductSubject,
  selectProductList,
  selectProductListById,
  selectProductNavigator,
  selectProductSize,
  selectProductDetail,
  selectWish,
  selectCartItems,
  selectContact,
  selectSizeGroup,
  insertWish,
  insertCart,
  insertEnquire,
  updateCart,
  deleteCart,
};
