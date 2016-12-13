'use strict';

var log = require('../../getLogger')('block recorder');
var moment = require('moment');
var timeHelper = require('./time');
var standupHelper = require('./getStandupReport');
var reportHelper = require('./doChannelReport');
var models = require('../../models');

module.exports = function doBlock(bot, message, blockChannel, blockUser) {
  log.verbose('Got user standup info:\n' + message.match[0]);

  var localReport = '';
  var content = message.match[4];
  var userRealName, thumbUrl;

  models.Channel.findOne({
    where: {
      name: blockChannel
    }
  }).then(function (channel) {
    if (channel) {
      models.Standup.findOrCreate({
        where: {
          channel: blockChannel,
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
          userRealName = response.user.real_name || response.user.name;
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
                channel: blockChannel,
                date: timeHelper.getReportFormat(),
                user: message.user
              }
            }
          ).then(function () {
            models.Standup.findOne({
              where: {
                channel: blockChannel,
                date: timeHelper.getReportFormat(),
                user: message.user
              }
            }).then(function(standup) {
              var now = timeHelper.getDisplayFormat();
              var channelTime = timeHelper.getDisplayFormat(channel.time);
              if (moment(now, 'hh:mm a Z').isBefore(moment(channelTime, 'hh:mm a Z'))) {
                log.verbose('Standup info recorded for ' + userRealName);
                bot.reply(message, {
                  text: 'Thanks! Your standup for <#'+blockChannel+
                        '> is recorded and will be reported at ' +
                        timeHelper.getDisplayFormat(channel.time) +
                        '.  It will look like:',
                  attachments: [ standupHelper(standup) ]
                });
              } else {
                log.verbose('Late report from '+userRealName+'; updating previous report');
                bot.reply(message, {
                  text: 'Thanks! Your standup for <#'+blockChannel+
                        '> is recorded.  It will look like:',
                  attachments: [ standupHelper(standup) ]
                });
                reportHelper(bot, blockChannel, true, userRealName);
              }
            });
          });
        });
      });
    }
  });
};
