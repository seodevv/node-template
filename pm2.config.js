module.exports = {
  apps: {
    name: 'template',
    script: './server.js',
    instances: 3,
    exec_mode: 'cluster',
    log_file: './logs/pm2.log',
    pid_file: './pm2.pid',
  },
};
