const { createResponse, mailFormat } = require('../../lib/common');
const { selectBasicInfo } = require('../../lib/query/oauth');
const {
  insertEmailInfo,
  selectEmailInfo,
  insertEmailSubscribe,
} = require('../../lib/query/email');

const router = require('express').Router();
const nodeMailer = require('nodemailer');
const CryptoJS = require('crypto-js');

router.post('/regist', async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) createResponse({ response: res, status: 400 });

  try {
    const data = await insertEmailInfo({ id, password });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return createResponse({ response: res, status: 400 });

  try {
    await insertEmailSubscribe(email);

    const { value: seceret } = await selectBasicInfo({
      name: 'encrypt',
      key: 'secret',
    });
    const [senderInfo] = await selectEmailInfo();
    const sender_id = senderInfo.id;
    const sender_password = CryptoJS.AES.decrypt(
      senderInfo.password,
      seceret
    ).toString(CryptoJS.enc.Utf8);

    const transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: { user: sender_id, pass: sender_password },
    });
    const mailOptions = {
      to: email,
      subject: '[Snowing] Thank you for subscribing.',
      html: mailFormat(
        'snowing',
        '[Snowing] Thank you for subscribing.',
        email,
        'https://localhost:5500'
      ),
    };
    const result = await transporter.sendMail(mailOptions);

    createResponse({ response: res, data: result.repsonse });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

module.exports = router;
