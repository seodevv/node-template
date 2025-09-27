const { createResponse } = require('../../lib/common');
const {
  selectCountry,
  selectProvince,
  selectAddress,
  selectWallets,
  selectOrder,
  selectOrderProduct,
  selectOrderDelivery,
  selectPromotion,
} = require('../../lib/query/my');
const { selectWish } = require('../../lib/query/product');

const router = require('express').Router();

router.get('/order/:type', async (req, res) => {
  const { type } = req.params;
  const { id, userId, addressId } = req.query;
  if (!type) return createResponse({ response: res, status: 500 });

  try {
    let data;
    switch (type) {
      case 'list':
        data = await selectOrder({ userId });
        break;
      case 'product':
        data = await selectOrderProduct({ orderId: id });
        break;
      case 'delivery':
        data = await selectOrderDelivery({ orderId: id });
        break;
      case 'address':
        [data] = await selectAddress({ id: addressId });
        break;
    }
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.get('/country', async (req, res) => {
  try {
    const data = await selectCountry();
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.get('/province', async (req, res) => {
  const { countryId } = req.query;
  if (!countryId) return createResponse({ response: res, status: 400 });
  try {
    const data = await selectProvince({ countryId });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.get('/address', async (req, res) => {
  const { user, id } = req.query;

  try {
    const data = await selectAddress({ user, id });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.get('/wallets', async (req, res) => {
  const { user, id } = req.query;

  try {
    const data = await selectWallets({ user, id });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.get('/wishlist', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return createResponse({ response: res, status: 400 });

  try {
    const data = await selectWish({ userId });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.get('/promotion', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return createResponse({ response: res, status: 400 });

  try {
    const data = await selectPromotion({ userId });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ repsonse: res, status: 500, error });
  }
});

module.exports = router;
