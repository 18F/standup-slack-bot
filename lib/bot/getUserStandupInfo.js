'use strict';

var timeHelper = require('../helpers').time;
var models = require('../../models');

function getUserStandupInfo(bot, message) {
  var standupChannel = message.match[1];
  var content = message.match[2];
  if (standupChannel[0] === 'C'){
    models.Channel.findOne({
      where: {
        name: standupChannel
      }
    }).then(function (channel) {
      if (channel) {
        models.Standup.findOrCreate({
          where: {
            channel: standupChannel,
            date: timeHelper.getReportFormat(),
            user: message.user
          }
        }).then(function (standup) {
          var notes = content.split(/\n/);
          var yesterday = standup.yesterday;
          var today = standup.today;
          var blockers = standup.blockers;
          var goal = standup.goal;
          for (var note in notes) {
            var item = notes[note].replace(/\n/g,'');
            switch (item.toLowerCase()[0]) {
              case 'y':
              yesterday = item;
              break;
              case 't':
              today = item;
              break;
              case 'b':
              blockers = item;
              break;
              case 'g':
              goal = item;
              break;
              default:
              console.log('no match for '+item);
            }
          }
          return models.Standup.update(
            {
              yesterday: yesterday,
              today: today,
              blockers: blockers,
              goal: goal
            },
            {
              where: {
                channel: standupChannel,
                date: timeHelper.getReportFormat(),
                user: message.user
              }
            });
        }).then(function () {
          bot.reply(message,'Thanks! Your standup for <#'+standupChannel+'> is recorded');
        });
      } else {
        return bot.reply(message,
          'The <#'+standupChannel+'> channel doesn\'t have any standups set'
        );
      }
    });
  } else {
    return bot.reply(message, 'I can only work with public channels. Sorry!');
  }
}

function attachListener(controller) {
  // TODO: allow multiple ways to separate messages (i.e. \n or ; or |)
  // TODO: update reports when edited
  // TODO: parse standup messages
  controller.hears(['standup <#(\\S*)>((.|\n)*)'],['direct_message'], getUserStandupInfo);
}

module.exports = attachListener;
