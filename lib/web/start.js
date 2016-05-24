'use strict';

var log = require('../../getLogger')('start web server');
var fs = require('fs');
var path = require('path');
var mustacheExpress = require('mustache-express');

module.exports = function start(botkit) {
  if(process.env.PORT) {
    botkit.setupWebserver(process.env.PORT, function(err, server) {
      if(err) {
        log.error(err);
        return;
      }

      var apiRoot = '/api';
      log.info('Registering API endpoints at ' + apiRoot);
      server.delete = server.del;
      var apiEndpoints = require('./api');
      for(let endpoint of apiEndpoints) {
        for(let handler of endpoint.handlers) {
          server[handler.verb.toLowerCase()](path.join(apiRoot, endpoint.path), handler.handler);
          log.verbose(' --> ' + handler.verb.toUpperCase() + '\t' + path.join(apiRoot, endpoint.path))
        }
      }

      var meEngine = mustacheExpress();
      server.engine('mustache', meEngine);
      server.set('view engine', 'mustache');
      server.set('views', __dirname + '/views');

      var data = { };
      var sections = [ 'glossary' ]
      for(let section of sections) {
        if(fs.existsSync(path.join(__dirname, 'data', `${section}.json`))) {
          data[section] = require(`./data/${section}.json`);
        } else {
          log.warn(`${section}.json does not exist`)
        }
      }

      var indexView = function(req, res) {
        meEngine.cache.reset();
        res.render('index', data);
      };
      server.get('/', indexView);
      server.get('/index.htm', indexView);
      server.get('/index.html', indexView);

      // Currently relying on an implicit express dependency,
      // but there is an open PR in botkit that will make the
      // static directory configurable.  Then this chunk here
      // won't be necessary and we can get on with being
      // happily ignorant about express or whatever botkit
      // is using under the hood.
      var express = require('express');
      server.use(express.static(__dirname + '/static'));
    });
  } else {
    log.warn('Web server not started: PORT env variable not set');
  }
}
