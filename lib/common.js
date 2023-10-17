const logger = require('./logger');

const capitalize = (str) => {
  return str.replace(/^[a-z]/, (item) => item.toLocaleUpperCase());
};

const mailFormat = (app, subject, target, url) => {
  return `<div style="margin: 50px auto; display: block; width: 600px;">
  <table style="padding: 15px; border: 1px solid #999; border-radius: 5px; font-family: sans-serif;">
      <thead>
          <tr style="text-align: center;">
              <td style="padding: 15px 30px; font-weight: bold; border-bottom: 1px solid #777">
                  <img src="https://seodevv.github.io/${app}.png" alt="logo" width="200px">
                  <h2 style="margin: 0;">
                  ${subject.replace(/^\[[a-zA-Z]+\]\s/, '')}
                  </h2>
              </td>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td style="padding: 0 20px;">
                  <p style="margin: 15px 0;">
                    <strong style="color: #0f8a81; font-size: 1.1rem;">
                      Thank you for subscribing.
                    </strong>
                  </p>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    From now on,
                    <br/>
                    [${target}]
                    <br/>
                    can receive ${capitalize(app)}'s newsletters.
                  </p>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    Please look forward to ${capitalize(
                      app
                    )}’s various snow items.
                  </p>
                  <div style="width: 100%">
                    <a href="${url}" style="margin: 20px 0; padding: 15px 25px; display: inline-block; background: #15c; border-radius: 5px; font-size:24px; color: #fff; text-decoration: none;">
                      visit
                    </a>
                  </div>
              </td>
          </tr>
      </tbody>
  </table>
</div>`;
};

const authMailFormat = (app, subject, target, otp) => {
  return `<div style="margin: 50px auto; display: block; width: 600px;">
  <table style="padding: 15px; border: 1px solid #999; border-radius: 5px; font-family: sans-serif;">
      <thead>
          <tr style="text-align: center;">
              <td style="padding: 15px 30px; font-weight: bold; border-bottom: 1px solid #777">
                  <img src="https://seodevv.github.io/${app}.png" alt="logo" width="200px">
                  <h2 style="margin: 0;">
                  ${subject.replace(/^\[[a-zA-Z]+\]\s/, '')}
                  </h2>
              </td>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td style="padding: 0 20px;">
                  <p style="margin: 15px 0;">
                    <strong style="color: #0f8a81; font-size: 1.1rem;">
                    Email verification has been requested from [${capitalize(
                      app
                    )}].
                    </strong>
                  </p>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    If you are 
                    <strong style="font-size: 1rem; text-decoration: underline;">
                      ${target},
                    </strong> 
                  </p>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    Please enter the code below into 
                    <strong style="font-size: 1rem; text-decoration: underline;">
                      ${capitalize(app)}.
                    </strong>
                  </p>
                  <h1 style="margin: 30px 0; text-align: center; text-decoration: underline;">${otp}</h1>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    This code is a one-time use and will not be reused.
                  </p>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    If you don't know 
                    <strong style="font-size: 1rem; text-decoration: underline;">
                      ${capitalize(app)}
                    </strong>
                    , please ignore this email.
                  </p>
              </td>
          </tr>
      </tbody>
  </table>
</div>`;
};

const createResponse = ({
  response,
  status = 200,
  data,
  url = '/',
  error,
  message = 'ok',
}) => {
  if (!response) {
    logger.error('createResponse - response required');
    return;
  }
  switch (status) {
    case 200:
      if (data) {
        response.json({ data, message });
      } else {
        response.json({ message });
      }
      break;
    case 300:
      response.redirect(url);
      break;
    case 400:
      logger.error(error);
      response
        .status(400)
        .json({ error, message: message !== 'ok' ? message : 'bad request' });
      break;
    case 500:
      logger.error(error);
      response
        .status(500)
        .json({ error, message: message !== 'ok' ? message : 'server error' });
      break;
  }
};

module.exports = { capitalize, mailFormat, authMailFormat, createResponse };
