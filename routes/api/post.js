const { createResponse } = require('../../lib/common');
const { insertEmailInfo } = require('../../lib/query/email');
const { selectBasicInfo } = require('../../lib/query/oauth');

const router = require('express').Router();

router.use('/mail', require('../mail/mail'));

const CryptoJS = require('crypto-js');
router.post('/test', async (req, res) => {
  const { id, password } = req.body;

  try {
    const { value: secret } = await selectBasicInfo({
      name: 'encrypt',
      key: 'secret',
    });

    const encryptPassword = CryptoJS.AES.encrypt(password, secret).toString();
    const data = insertEmailInfo({ id, password: encryptPassword });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

module.exports = router;
