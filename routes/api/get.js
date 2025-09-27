const router = require('express').Router();
const logger = require('../../lib/logger');
const { createResponse } = require('../../lib/common');
const { selectBasicInfo } = require('../../lib/query/oauth');

router.use('/product', require('../product/getProduct'));
router.use('/my', require('../my/getMy'));

router.get('/secret', async (req, res) => {
  try {
    const { value: data } = await selectBasicInfo({
      name: 'encrypt',
      key: 'secret',
    });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.get('/wish', async (req, res) => {
  const { userId, listId } = req.query;
  if (!userId || !listId) return createResponse({ response: res, status: 400 });
  try {
    const check = await selectWish({ userId, listId });
    let data;
    if (check.length === 0) {
      data = { result: false };
    } else {
      data = { result: true };
    }
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

const axios = require('axios');
const { selectWish } = require('../../lib/query/product');
router.get('/insta/feeds', async (req, res) => {
  const { page = 0 } = req.query;
  const length = 12 * (Number(page) + 1);

  try {
    const { value: user_id } = await selectBasicInfo({
      name: 'instagram',
      key: 'user_id',
    });
    const { value: access_token } = await selectBasicInfo({
      name: 'instagram',
      key: 'access_token',
    });

    const request_url =
      'https://graph.instagram.com/' +
      user_id +
      '/media' +
      '?fields=id,media_type,media_url,permalink,thumbnail_url,username,caption,timestamp' +
      '&access_token=' +
      access_token;
    const { data: getFeeds } = await axios.get(request_url);

    let data = getFeeds.data;
    let paging = getFeeds.paging;
    let isEnd = false;
    while (data.length < length) {
      if (isEnd) break;
      if (paging.next) {
        const { data: getMores } = await axios.get(paging.next);
        data = data.concat(getMores.data);
        paging = getMores.paging;
        if (!getMores.paging.next) isEnd = true;
      } else {
        isEnd = true;
      }
    }

    createResponse({
      response: res,
      data: { feeds: data.slice(0, length), isEnd },
    });
  } catch (error) {
    console.error(error);
    createResponse({ response: res, error, status: 500 });
  }
});

module.exports = router;
