'use strict';

var log = require('../../getLogger')('get user standup');
var moment = require('moment');
var helpers = require('../helpers');
var models = require('../../models');

function getUserStandupInfo(bot, message) {
  var standupChannel = message.match[2];
  var content = message.match[4];
  var localReport = '';
  log.verbose('Got user standup info:\n' + message.match[0]);

  var channel, user;

  if (standupChannel[0] === 'C'){
    models.Channel.findOne({
      where: {
        name: standupChannel
      }
    }).then(function (dbChannel) {
      if (dbChannel) {
        channel = dbChannel;
        return helpers.getUser(message.user);
      } else {
        log.info('Channel doesn\'t have a standup scheduled');
        bot.reply(message,
          'The <#'+standupChannel+'> channel doesn\'t have any standups set'
        );
        return Promise.reject('No channel');
      }
    }).then(function (fullUser) {
      user = fullUser;

      return models.Standup.findOrCreate({
        where: {
          channel: standupChannel,
          date: helpers.time.getReportFormat(),
          user: message.user,
          userRealName: user.real_name
        }
      });
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
            date: helpers.time.getReportFormat(),
            user: message.user
          }
        });
    }).then(function () {
      return models.Standup.findOne({
        where: {
          channel: standupChannel,
          date: helpers.time.getReportFormat(),
          user: message.user
        }
      });
    }).then(function(standup) {
      log.verbose('Standup info recorded for ' + user.real_name);
      bot.reply(message, {
        text: 'Thanks! Your standup for <#'+standupChannel+
              '> is recorded and will be reported at ' +
              helpers.time.getDisplayFormat(channel.time) +
              '.  It will look like:',
        attachments: [ helpers.getStandupReport(standup) ]
      });
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
  controller.hears(['(standup )?<#(\\S*?)(\\|\\S*)?>((.|\n)*)'],['direct_message'], getUserStandupInfo);
  log.verbose('Attached');
}

module.exports = attachListener;
