const { createResponse } = require('../../lib/common');
const logger = require('../../lib/logger');
const {
  insertEnquire,
  insertCart,
  deleteCart,
  updateCart,
} = require('../../lib/query/product');

const router = require('express').Router();

router.post('/cart', async (req, res) => {
  const { type, items, user } = req.body;
  if (!items || !user) return createResponse({ response: res, status: 400 });

  items.forEach(async (item) => {
    try {
      switch (type) {
        case 'add':
          await insertCart({
            user: user,
            product: item.productId,
            size: item.sizeId,
            quantity: item.quantity,
          });
          break;
        case 'delete':
          await deleteCart({
            user: user,
            product: item.productId,
            size: item.sizeId,
          });
          break;
        case 'increase':
        case 'decrease':
          await updateCart({
            type: type,
            user: user,
            product: item.productId,
            size: item.sizeId,
          });
          break;
      }
    } catch (error) {
      logger.error(error);
    }
  });

  createResponse({ response: res });
});

router.post('/enquire', async (req, res) => {
  const { first, last, email, phone, message } = req.body;
  if (!first || !last || !email || !phone || !message)
    return createResponse({ response: res, status: 400 });

  try {
    await insertEnquire({ first, last, email, phone, message });
    createResponse({ response: res, data: { result: true } });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

module.exports = router;
