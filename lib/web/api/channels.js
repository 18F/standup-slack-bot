'use strict';

var log = require('../../../getLogger')('channels api');
var models = require('../../../models');

module.exports = [
  {
    description: 'Get a list of all channels with a scheduled standup',
    path: 'channels',
    handlers: [{
      verb: 'get',
      handler: function(request, response, next) {
        models.Channel.findAll({ attributes: [ 'name', 'time', 'reminderMinutes', 'reminderTime' ]})
          .then(function(channels) {
            response.send(channels.map(function(c) { return c.dataValues; }));
          })
          .catch(function(err) {
            log.error(err);
            response.send(500);
          })
          .then(next);
      },
    }]
  }
]
