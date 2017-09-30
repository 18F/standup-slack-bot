

const log = require('../../getLogger')('start web server');
const fs = require('fs');
const path = require('path');
const buildPage = require('./buildPage');

module.exports = function start(botkit) {
  if (process.env.PORT) {
    botkit.setupWebserver(process.env.PORT, (err, server) => {
      if (err) {
        log.error(err);
        return;
      }

      const apiRoot = '/api';
      log.info(`Registering API endpoints at ${apiRoot}`);
      server.delete = server.del;
      const apiEndpoints = require('./api');
      for (const endpoint of apiEndpoints) {
        for (const handler of endpoint.handlers) {
          server[handler.verb.toLowerCase()](path.join(apiRoot, endpoint.path), handler.handler);
          log.verbose(` --> ${handler.verb.toUpperCase()}\t${path.join(apiRoot, endpoint.path)}`);
        }
      }

      const indexView = function (req, res) {
        res.send(buildPage());
      };
      server.get('/', indexView);
      server.get('/index.htm', indexView);
      server.get('/index.html', indexView);
    });
  } else {
    log.warn('Web server not started: PORT env variable not set');
  }
};
