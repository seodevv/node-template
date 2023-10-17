const router = require('express').Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
const CryptoJS = require('crypto-js');
const {
  createResponse,
  authMailFormat,
  capitalize,
} = require('../../lib/common');
const {
  selectOauth,
  insertBasicInfo,
  selectBasicInfo,
} = require('../../lib/query/oauth');
const { insertUser, selectUser } = require('../../lib/query/user');
const { selectEmailInfo } = require('../../lib/query/email');

router.get('/insta/code', async (req, res) => {
  const { code } = req.query;

  try {
    const [getTokenInfo] = await selectOauth({ type: 'getToken' });
    const { data: tokenData } = await axios({
      method: 'post',
      url: getTokenInfo.request_url,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        client_id: getTokenInfo.client_id,
        client_secret: getTokenInfo.client_secret,
        grant_type: getTokenInfo.grant_type,
        redirect_uri: getTokenInfo.redirect_uri,
        code,
      },
    });

    insertBasicInfo({
      name: 'instagram',
      key: 'user_id',
      value: tokenData.user_id,
    });

    const [getLongTokenInfo] = await selectOauth({ type: 'getLongToken' });
    const { data: longTokenData } = await axios(
      getLongTokenInfo.request_url +
        '?grant_type=' +
        getLongTokenInfo.grant_type +
        '&client_secret=' +
        getLongTokenInfo.client_secret +
        '&access_token=' +
        tokenData.access_token
    );

    insertBasicInfo({
      name: 'instagram',
      key: 'access_token',
      value: longTokenData.access_token,
    });

    createResponse({ response: res, data: longTokenData.access_token });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.post('/user/login/google', async (req, res) => {
  const { access_token, token_type } = req.body;
  if (!access_token || !token_type) {
    return createResponse({ response: res, status: 400 });
  }

  try {
    const [{ request_url }] = await selectOauth({
      id: 'google',
      type: 'getProfile',
    });
    const config = {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
    };
    const {
      data: { email, name, picture },
    } = await axios.get(request_url, config);
    const data = await insertUser({
      type: 'google',
      email,
      nick: name,
      picture,
    });
    const { value: secret } = await selectBasicInfo({
      name: 'encrypt',
      key: 'secret',
    });
    const token = jwt.sign(data, secret);
    res.cookie('token', token, {
      sameSite: 'none',
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    createResponse({ response: res, data });
  } catch (error) {
    console.error(error);
    createResponse({ response: res, status: 500, error });
  }
});

router.post('/user/login/app', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return createResponse({ response: res, status: 400 });

  try {
    const { value: secret } = await selectBasicInfo({
      name: 'encrypt',
      key: 'secret',
    });
    const [data] = await selectUser({ type: 'app', email, password });
    const decryptPassword = CryptoJS.AES.decrypt(password, secret).toString(
      CryptoJS.enc.Utf8
    );
    const comparePassword = CryptoJS.AES.decrypt(
      data.password,
      secret
    ).toString(CryptoJS.enc.Utf8);
    if (decryptPassword === comparePassword) {
      delete data.password;
      const token = jwt.sign(data, secret);
      res.cookie('token', token, {
        sameSite: 'none',
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      createResponse({
        response: res,
        data: {
          ...data,
          result: true,
        },
      });
    } else {
      createResponse({ response: res, data: { result: false } });
    }
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.get('/user/login/info', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return createResponse({ response: res, status: 400 });
  }

  try {
    const { value: secret } = await selectBasicInfo({
      name: 'encrypt',
      key: 'secret',
    });
    const { id, type, email } = jwt.verify(token, secret);
    const [data] = await selectUser({ id, type, email });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.post('/user/signup/duplicated', async (req, res) => {
  const { email } = req.body;
  if (!email) return createResponse({ response: res, status: 400 });

  try {
    const [duplicate] = await selectUser({ type: 'app', email });
    if (duplicate) {
      createResponse({ response: res, data: { duplicated: true } });
    } else {
      createResponse({ response: res, data: { duplicated: false } });
    }
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.post('/user/signup/code', async (req, res) => {
  const { email } = req.body;
  if (!email) return createResponse({ response: res, status: 400 });

  try {
    const { value: secret } = await selectBasicInfo({
      name: 'encrypt',
      key: 'secret',
    });
    const [senderInfo] = await selectEmailInfo();
    const sender_id = senderInfo.id;
    const sender_password = CryptoJS.AES.decrypt(
      senderInfo.password,
      secret
    ).toString(CryptoJS.enc.Utf8);

    const transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: { user: sender_id, pass: sender_password },
    });
    const app = 'snowing';
    const subject = `[${capitalize(app)}] Email verification request`;
    const otp = Math.random().toString(36).substring(2, 8).toUpperCase();
    const mailOptions = {
      to: email,
      subject,
      html: authMailFormat(app, subject, email, otp),
    };
    await transporter.sendMail(mailOptions);

    createResponse({ response: res, data: otp });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.post('/user/signup/regist', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return createResponse({ response: res, status: 400 });

  try {
    const { value: secret } = await selectBasicInfo({
      name: 'encrypt',
      key: 'secret',
    });

    const data = await insertUser({
      type: 'app',
      email,
      password,
      nick: email.replace(/@[a-zA-Z\.]+/, ''),
      picture: 'profile.png',
    });
    const token = jwt.sign(data, secret);
    res.cookie('token', token, {
      sameSite: 'none',
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    createResponse({ response: res, data });
  } catch (error) {
    createResponse({ response: res, status: 500, error });
  }
});

router.post('/user/logout', async (req, res) => {
  res.cookie('token', '', {
    sameSite: 'none',
    httpOnly: true,
    secure: true,
    maxAge: 0,
  });
  createResponse({ response: res });
});
module.exports = router;
