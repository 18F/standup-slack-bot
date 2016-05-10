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

  var channel, user, userRealName, thumbUrl;

  if (standupChannel[0] === 'C'){
    models.Channel.findOne({
      where: {
        name: standupChannel
      }
    }).then(function (dbChannel) {
      if (dbChannel) {
        channel = dbChannel;

        models.Standup.findOrCreate({
          where: {
            channel: standupChannel,
            date: helpers.time.getReportFormat(),
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
            var firstChar = item[0].toLowerCase();
            item = item.replace(/^[ytbg]:?\s*/i, '');

            switch (firstChar) {
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
              log.info('no match for '+item);
            }
          }

          bot.api.users.info({'user':message.user}, function(err, response) {
            userRealName = response.user.real_name;
            thumbUrl = response.user.profile.image_72;
            models.Standup.update(
              {
                yesterday: yesterday,
                today: today,
                blockers: blockers,
                goal: goal,
                userRealName: userRealName,
                thumbUrl: thumbUrl
              },
              {
                where: {
                  channel: standupChannel,
                  date: helpers.time.getReportFormat(),
                  user: message.user
                }
              }
            ).then(function () {
              models.Standup.findOne({
                where: {
                  channel: standupChannel,
                  date: helpers.time.getReportFormat(),
                  user: message.user
                }
              }).then(function(standup) {
                log.verbose('Standup info recorded for ' + userRealName);
                bot.reply(message, {
                  text: 'Thanks! Your standup for <#'+standupChannel+
                        '> is recorded and will be reported at ' +
                        helpers.time.getDisplayFormat(channel.time) +
                        '.  It will look like:',
                  attachments: [ helpers.getStandupReport(standup) ]
                });
              });
            });
          });
        });
      } else {
        log.info('Channel doesn\'t have a standup scheduled');
        bot.reply(message,
          'The <#'+standupChannel+'> channel doesn\'t have any standups set'
        );
      }
    });
  } else {
    log.warn('Channel is not public');
    bot.reply(message, 'I can only work with public channels. Sorry!');
  }
}

function attachListener(controller) {
  // TODO: allow multiple ways to separate messages (i.e. \n or ; or |)
  // TODO: update reports when edited
  // TODO: parse standup messages
  controller.hears(['^(standup )?<#(\\S*?)(\\|\\S*)?>((.|\n)*)'],['direct_message'], getUserStandupInfo);
  controller.on('message_changed', function(bot, m) {
    var msg = m.message;
    m.user = m.message.user;
    m.match = m.message.text.match(/(standup )?<#(\S*?)(\|\S*)?>((.|\n)*)/);
    if(m.match && m.channel[0] === 'D') {
      getUserStandupInfo(bot, m);
    }
  });
  log.verbose('Attached');
}

module.exports = attachListener;
