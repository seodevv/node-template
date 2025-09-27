const { createResponse } = require('../../lib/common');
const { insertWish } = require('../../lib/query/product');

const router = require('express').Router();

router.use('/mail', require('../mail/mail'));
router.use('/product', require('../product/postProduct'));
router.use('/my', require('../my/postMy'));

router.post('/wish', async (req, res) => {
  const { userId, listId } = req.body;
  if (!userId || !listId) return createResponse({ response: res, status: 400 });

  try {
    await insertWish({ userId, listId });
    createResponse({ response: res });
  } catch (error) {
    createResponse({ response: res, status: 400, error });
  }
});

module.exports = router;
