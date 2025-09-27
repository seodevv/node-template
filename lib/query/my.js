const { promisePool } = require('../db');

const selectOrder = async ({ id, userId }) => {
  let queryString = `
  SELECT
    o.id,
    o.user AS userId,
    os.id AS statusId,
    os.status,
    o.address AS addressId,
    o.modified,
    o.ordered
  FROM
    \`order\` o
  INNER JOIN
    order_status os
    ON os.id = o.status
  WHERE
    1 = 1
  `;
  if (id) {
    queryString += '  AND o.id = ?\n';
  }
  if (userId) {
    queryString += '  AND o.user = ?\n';
  }

  queryString += '  ORDER BY\n';
  queryString += '    o.modified DESC\n';

  try {
    let params = [];
    if (id) params.push(id);
    if (userId) params.push(userId);
    const [rows] = await promisePool.query(queryString, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectOrderProduct = async ({ orderId }) => {
  let queryString = `
  SELECT
    op.order AS orderId,
    pl.id AS productId,
    pl.name,
    pl.price,
    pl.image,
    s.id AS sizeId,
    s.size,
    op.quantity
  FROM
    order_product op
  INNER JOIN
    product_list pl
    ON pl.id = op.product
  INNER JOIN
    sizes s
    ON s.id = op.size
  WHERE
    1 = 1
  `;
  if (orderId) {
    queryString += '    AND op.order = ?\n';
  }
  try {
    let params = [];
    if (orderId) params.push(orderId);
    const [rows] = await promisePool.query(queryString, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectOrderDelivery = async ({ orderId }) => {
  let queryString = `
  SELECT
    od.order AS orderId,
    dc.id AS companyId,
    dc.name AS companyName,
    dc.url AS companyUrl,
    od.number,
    os.id AS statusId,
    os.status,
    od.regist
  FROM
    order_delivery od
  INNER JOIN
    delivery_company dc 
    ON dc.id = od.company
  INNER JOIN
    order_status os
    ON os.id = od.status
  WHERE
    od.order = ?
  ORDER BY
    od.regist DESC
  `;
  try {
    const [rows] = await promisePool.query(queryString, [orderId]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectCountry = async () => {
  let queryString = `
  SELECT
    c.id as countryId,
    c.country
  FROM
    country c
  `;
  try {
    const [rows] = await promisePool.query(queryString);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectProvince = async ({ countryId }) => {
  let queryString = `
  SELECT
    c.id AS countryId,
    c.country,
    p.id AS provinceId,
    p.province
  FROM
    country c
  INNER JOIN
    province p
    ON p.country = c.id
  WHERE
    c.id = ?
  `;
  try {
    const [rows] = await promisePool.query(queryString, [countryId]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectAddress = async ({ user, id }) => {
  let queryString = `
  SELECT
    a.id,
    a.user AS userId,
    c.id AS countryId,
    c.country,
    p.id AS provinceId,
    p.province,
    a.lastname AS lastName,
    a.firstname AS firstName,
    a.postal_code,
    a.city,
    a.address,
    a.etc,
    a.phone,
    a.default AS isDefault
  FROM
    addresses a
  INNER JOIN
    country c
    ON c.id = a.country
  INNER JOIN
    province p
    ON p.id = a.province
  WHERE
    1 = 1
  `;
  if (user) {
    queryString += '    AND a.user = ?\n';
  }

  if (id) {
    queryString += '    AND a.id = ?\n';
  }

  queryString += '  ORDER BY\n';
  queryString += '    a.default DESC,\n';
  queryString += '    a.id DESC\n';

  try {
    let params = [];
    if (user) params.push(user);
    if (id) params.push(id);

    const [rows] = await promisePool.query(queryString, params);
    return rows;
  } catch (error) {}
};

const selectWallets = async ({ user, id }) => {
  let queryString = `
  SELECT
    w.id,
    w.user as userId,
    w.isDefault,
    w.card_data
  FROM
    wallets w
  WHERE
    1 = 1
  `;
  if (user) {
    queryString += '    AND w.user = ?\n';
  }

  if (id) {
    queryString += '    AND w.id = ?\n';
  }

  queryString += '  ORDER BY\n';
  queryString += '    w.isDefault DESC,\n';
  queryString += '    w.id DESC\n';

  try {
    let params = [];
    if (user) params.push(user);
    if (id) params.push(id);

    const [rows] = await promisePool.query(queryString, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

const selectPromotion = async ({ userId }) => {
  let queryString = `
  SELECT 
    pu.user as userId,
    p.id AS promotionId,
    p.name AS promotionName,
    p.sales AS sales,
    pu.expired
  FROM 
    promotion_user pu
  INNER JOIN
    promotion p
    ON p.id = pu.promotion
  WHERE
    pu.user = ?
  `;
  try {
    const [rows] = await promisePool.query(queryString, [userId]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const insertAddresses = async ({
  userId,
  isDefault,
  countryId,
  provinceId,
  lastName,
  firstName,
  postal_code,
  city,
  address,
  etc,
  phone,
}) => {
  let queryString = `
  INSERT INTO addresses
    (\`user\`, 
    \`country\`, 
    \`province\`, 
    \`lastname\`,
    \`firstname\`,
    \`postal_code\`,
    \`city\`,
    \`address\`,
    \`etc\`,
    \`phone\`,
    \`default\`)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await promisePool.query(queryString, [
      userId,
      countryId,
      provinceId,
      lastName,
      firstName,
      Number(postal_code),
      city,
      address,
      etc,
      phone,
      isDefault,
    ]);
    return true;
  } catch (error) {
    throw error;
  }
};

const insertWallets = async ({ userId, isDefault, card_data }) => {
  let queryString = `INSERT INTO wallets(\`user\`, \`isDefault\`, \`card_data\`) VALUES (?, ?, ?)`;

  try {
    await promisePool.query(queryString, [userId, isDefault, card_data]);
    return true;
  } catch (error) {
    throw error;
  }
};

const updateAddresesDefaultSetFalse = async ({ userId }) => {
  let queryString = `
  UPDATE
    addresses a
  SET
    a.default = false
  WHERE
    a.user = ?
  `;
  try {
    await promisePool.query(queryString, [userId]);
    return true;
  } catch (error) {
    throw error;
  }
};

const updateWalletDefaultSetFalse = async ({ userId }) => {
  let queryString = `
  UPDATE
    wallets w
  SET
    w.isDefault = false
  WHERE
    w.user = ?
  `;
  try {
    await promisePool.query(queryString, [userId]);
    return true;
  } catch (error) {
    throw error;
  }
};

const updateAddresses = async ({
  id,
  isDefault,
  countryId,
  provinceId,
  lastName,
  firstName,
  postal_code,
  city,
  address,
  etc,
  phone,
}) => {
  let queryString = `
  UPDATE
    addresses a
  SET
    a.country = ?,
    a.province = ?,
    a.lastname = ?,
    a.firstname = ?,
    a.postal_code = ?,
    a.city = ?,
    a.address = ?,
    a.etc = ?,
    a.phone = ?,
    a.default = ?
  WHERE
    id = ?
  `;
  try {
    await promisePool.query(queryString, [
      countryId,
      provinceId,
      lastName,
      firstName,
      Number(postal_code),
      city,
      address,
      etc,
      phone,
      isDefault,
      id,
    ]);
    return true;
  } catch (error) {
    throw error;
  }
};

const updateWallets = async ({ id, card_data }) => {
  let queryString = `
  UPDATE
    wallets w
  SET
    w.card_data = ?
  WHERE
    w.id = ?`;

  try {
    await promisePool.query(queryString, [card_data, id]);
    return true;
  } catch (error) {
    throw error;
  }
};

const deleteAddresses = async ({ id }) => {
  let queryString = `
  DELETE FROM
    addresses
  WHERE
    id = ?
  `;
  try {
    await promisePool.query(queryString, [id]);
    return true;
  } catch (error) {
    throw error;
  }
};

const deleteWallets = async ({ id }) => {
  let queryString = `
  DELETE FROM
    wallets
  WHERE
    id = ?
    `;
  try {
    const check = await selectWallets({ id });
    await promisePool.query(queryString, [id]);
    if (check[0] && check[0].isDefault) {
      let updateString = `
      UPDATE
        wallets w,
        (SELECT
          MAX(w.id) AS maxId
        FROM
          wallets w
        WHERE
          w.user = ?) a
      SET
        w.isDefault = TRUE
      WHERE
        w.id = a.maxId;
      `;
      await promisePool.query(updateString, [check[0].userId]);
    }
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  selectOrder,
  selectOrderProduct,
  selectOrderDelivery,
  selectCountry,
  selectProvince,
  selectAddress,
  selectWallets,
  selectPromotion,
  insertAddresses,
  insertWallets,
  updateAddresesDefaultSetFalse,
  updateWalletDefaultSetFalse,
  updateAddresses,
  updateWallets,
  deleteAddresses,
  deleteWallets,
};
