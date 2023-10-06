require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
// const https = require('https');
const cors = require('cors');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const server = http.createServer(app);
// const server = https.createServer(
//   {
//     key: fs.readFileSync(__dirname + '/.cert/key.pem', 'utf-8'),
//     cert: fs.readFileSync(__dirname + '/.cert/cert.pem', 'utf-8'),
//   },
//   app
// );

const logger = require('./lib/logger.js');
const morgan = require('morgan');

// cors policy config
const corsOptions = {
  origin: ['http://localhost:5500'],
  methods: ['GET', 'POST', 'OPTIONS'],
  // transports: ['websocket'],
  // credentials: true,
};

// webSocket cors policy
const io = require('socket.io')(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));

// http logger (morgan)
app.use(
  morgan(':remote-addr - :remote-user :method :status :url :response-time ms', {
    stream: logger.stream,
  })
);

// public config
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routing
// app.use('/auth', require('./routes/auth/auth.js'));

// litening the server
const serverHost = process.env.SERVER_HOST || '0.0.0.0';
const serverPort = process.env.SERVER_PORT || 8080;
// let server;
// if (fs.existsSync('.cert/key.pem') && fs.existsSync('.cert/cert.pem')) {
// server = https
//   .createServer(
//     {
//       key: fs.readFileSync(__dirname + '/.cert/key.pem', 'utf-8'),
//       cert: fs.readFileSync(__dirname + '/.cert/cert.pem', 'utf-8'),
//     },
//     app
//   )
//   .listen(serverPort, serverHost, () => {
//     logger.info(`litening on https://${serverHost}:${serverPort}`);
//   });
// } else {
//   server = app.listen(serverPort, serverHost, () => {
//     logger.info(`litening on http://${serverHost}:${serverPort}`);
//   });
// }
server.listen(serverPort, serverHost, () => {
  logger.info(`litening on http://${serverHost}:${serverPort}`);
});
