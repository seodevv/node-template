const { createResponse } = require('../../lib/common');
const logger = require('../../lib/logger');
const {
  selectProductList,
  selectProductType,
  selectProductSubject,
  selectProductNavigator,
  selectProductSize,
  selectProductListById,
  selectProductDetail,
  selectProductBanner,
  selectProductBrands,
  selectSizeGroup,
  selectProductCategories,
  selectContact,
  selectCartItems,
} = require('../../lib/query/product');

const router = require('express').Router();

router.get('/banner', async (req, res) => {
  const { type, name } = req.query;
  if (!type) return createResponse({ response: res, status: 400 });

  try {
    let data;
    switch (type) {
      case 'type':
        data = await selectProductType({ banner: true });
        break;
      case 'subject':
        data = await selectProductSubject({ banner: true, name });
        break;
      case 'banner':
        data = await selectProductBanner({ name });
        break;
    }
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.get('/category', async (req, res) => {
  const { category } = req.query;
  if (!category) return createResponse({ response: res, error: 400 });

  try {
    const data = await selectProductCategories({ category });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.get('/type', async (req, res) => {
  try {
    const data = await selectProductType();
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.get('/subject', async (req, res) => {
  try {
    const data = await selectProductSubject({});
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.get('/list', async (req, res) => {
  const { order, limit, brand, price, size, category, type, subjects } =
    req.query;
  if (!order) return createResponse({ response: res, status: 400 });

  try {
    const data = await selectProductList({
      order,
      limit,
      brand,
      price,
      size,
      category,
      type,
      subjects,
    });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.get('/list/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return createResponse({ response: res, status: 400 });

  try {
    const data = await selectProductListById({ id });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.get('/navigator', async (req, res) => {
  const { id } = req.query;
  if (!id) return createResponse({ response: res, status: 400 });

  try {
    const data = await selectProductNavigator({ id });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.get('/size', async (req, res) => {
  const { id } = req.query;
  if (!id) return createResponse({ response: res, status: 400 });

  try {
    const data = await selectProductSize({ id });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.get('/size/group', async (req, res) => {
  try {
    const data = await selectSizeGroup();
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.get('/detail', async (req, res) => {
  const { id } = req.query;
  if (!id) return createResponse({ response: res, status: 400 });

  try {
    const data = await selectProductDetail({ id });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.get('/brands', async (req, res) => {
  const { category, brand } = req.query;
  try {
    const data = await selectProductBrands({ category, brand });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.get('/contact', async (req, res) => {
  const { key } = req.query;
  try {
    const data = await selectContact({ key });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.get('/cart', async (req, res) => {
  const { user, ids } = req.query;
  if (!user && !ids) return createResponse({ response: res, status: 400 });

  try {
    const data = await selectCartItems({ user, ids });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

module.exports = router;
