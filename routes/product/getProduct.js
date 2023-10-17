const { createResponse } = require('../../lib/common');
const logger = require('../../lib/logger');
const {
  selectProductList,
  selectProductType,
  selectProductSubject,
} = require('../../lib/query/product');

const router = require('express').Router();

router.get('/banner', async (req, res) => {
  const { type } = req.query;
  if (!type) return createResponse({ response: res, status: 400 });
  try {
    let data;
    switch (type) {
      case 'type':
        data = await selectProductType();
        break;
      case 'subject':
        data = await selectProductSubject({});
        break;
    }
    setTimeout(() => {
      createResponse({ response: res, data });
    }, 1000);
  } catch (error) {
    createResponse({ response: res, error });
  }
});

router.get('/type', async (req, res) => {
  try {
    const data = await selectProductType();
    setTimeout(() => {
      createResponse({ response: res, data });
    }, 1000);
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.get('/subject', async (req, res) => {
  try {
    const data = await selectProductSubject({});
    setTimeout(() => {
      createResponse({ response: res, data });
    }, 1000);
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.get('/list', async (req, res) => {
  const { type } = req.query;
  if (!type) return createResponse({ response: res, status: 400 });

  try {
    const data = await selectProductList({ type });
    setTimeout(() => {
      createResponse({ response: res, data });
    }, 1000);
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

module.exports = router;
