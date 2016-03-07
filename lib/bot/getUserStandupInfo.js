'use strict';

var log = require('../../getLogger')('get user standup');
var moment = require('moment');
var timeHelper = require('../helpers').time;
var models = require('../../models');

function getUserStandupInfo(bot, message) {
  var standupChannel = message.match[2];
  var content = message.match[3];
  var localReport = '';
  log.verbose('Got user standup info:\n' + message.match[0]);

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
          var notes = content.trim().split(/\n/);
          var yesterday = standup.yesterday;
          var today = standup.today;
          var blockers = standup.blockers;
          var goal = standup.goal;

          for (var note in notes) {
            localReport += '\n\n';
            var item = notes[note].replace(/\n/g,'');
            switch (item.toLowerCase()[0]) {
              case 'y':
                localReport += '*Yesterday*\n' + item;
                yesterday = item;
                break;
              case 't':
                localReport += '*Today*\n' + item;
                today = item;
                break;
              case 'b':
                localReport += '*Blockers*\n' + item;
                blockers = item;
                break;
              case 'g':
                localReport += '*Goal*\n' + item;
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
          // Time has to be 4 digits for moment
          // to parse it properly
          var time = String(channel.time);
          if(time.length < 4) {
            time = '0' + time;
          }
          time = moment.utc(time, 'HHmm');

          log.verbose('Standup info recorded');
          bot.reply(message, 'Thanks! Your standup for <#'+standupChannel+'> is recorded and will be reported at ' +
            timeHelper.getDisplayFormat(time) +
            '.  It will look like:' + localReport);
        });
      } else {
        log.info('Channel doesn\'t have a standup scheduled');
        return bot.reply(message,
          'The <#'+standupChannel+'> channel doesn\'t have any standups set'
        );
      }
    });
  } else {
    log.warn('Channel is not public');
    return bot.reply(message, 'I can only work with public channels. Sorry!');
  }
}

function attachListener(controller) {
  // TODO: allow multiple ways to separate messages (i.e. \n or ; or |)
  // TODO: update reports when edited
  // TODO: parse standup messages
  controller.hears(['(standup )?<#(\\S*)>((.|\n)*)'],['direct_message'], getUserStandupInfo);
  log.verbose('Attached');
}

module.exports = attachListener;
