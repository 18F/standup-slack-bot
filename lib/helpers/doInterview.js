'use strict';

// var async = require('async');
// var _ = require('underscore');
var log = require('../../getLogger')('interview recorder');
var models = require('../../models');
var moment = require('moment');
var timeHelper = require('./time');
var standupHelper = require('./getStandupReport');
var reportHelper = require('./doChannelReport');

module.exports = function doInterview(bot, interviewChannel, interviewUser) {
  log.verbose('Starting an interview with '+interviewUser);
  console.log(interviewChannel);
  models.Channel.findOne({
    where: {
      name: interviewChannel
    }
  }).then(function(channel) {
    if (channel) {
      var yesterday;
      var today;
      var blockers;
      var goal;
      var userRealName;
      var thumbUrl;
      // var teamName;
      // var audience = channel.audience === null ? '<!here>' : channel.audience;
      // if (audience.search(/<!/) !== 0) {
      //   audience = '@'+audience;
      // }
      var pastBlockers = '';
      bot.api.users.info({'user':interviewUser}, function(err, response) {
        userRealName = response.user.real_name;
        thumbUrl = response.user.profile.image_72;
      });
      // bot.api.team.info({}, function(err, response) {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     teamName = response.team.name;
      //   }
      // });
      models.Standup.findAll({
        where: {
          user: interviewUser,
          channel: interviewChannel,
          createdAt: {
            $gt: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }).then(function (standups) {
        if (standups.length > 0) {
          pastBlockers += ' Recent blockers were:';
        }
        for (var s in standups) {
          pastBlockers += '\n> '+standups[s].blockers;
        }
      });
      bot.startPrivateConversation({user: interviewUser}, function(response, convo){
        // TODO: consider allowing multi-line responses
        convo.say('Hey there! Let\'s record your standup for <#'+interviewChannel+'>'+
          ' (Say "skip" to skip any of the questions):');
        convo.ask('What did you do yesterday?', function(response, conversation) {
          if (!response.text.match(/^skip$/ig)) {
            yesterday = response.text;
          } else {
            yesterday = null;
          }
          conversation.next();
        });
        convo.ask('What are you doing today? (Use :pager: if you\'re available'+
        ' for projects)', function(response, conversation) {
          if (!response.text.match(/^skip$/ig)) {
            today = response.text;
          } else {
            today = null;
          }
          conversation.next();
        });
        convo.ask('What are your blockers?'+pastBlockers, function(response, conversation) {
          if (!response.text.match(/^skip$/ig)) {
            blockers= response.text;
          } else {
            blockers= null;
          }
          conversation.next();
        });
        convo.ask('Any major goal for the day?', function(response, conversation) {
          if (!response.text.match(/^skip$/ig)) {
            goal = response.text;
          } else {
            goal = null;
          }
          conversation.next();
        });
        convo.on('end',function(convo) {

          if (convo.status === 'completed') {
            // botkit provides a cool function to get all responses, but it was easier
            // to just set them during the convo
            // var res = convo.extractResponses();

            models.Standup.findOrCreate({
              where: {
                channel: interviewChannel,
                date: timeHelper.getReportFormat(),
                user: interviewUser
              }
            }).then(function (standup) {
              if (!yesterday) {
                yesterday = standup.yesterday;
              }
              if (!today) {
                today = standup.today;
              }
              if (!blockers) {
                blockers = standup.blockers;
              }
              if (!goal) {
                goal = standup.goal;
              }

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
                    channel: interviewChannel,
                    date: timeHelper.getReportFormat(),
                    user: interviewUser
                  }
                }
              ).then(function () {
                var latestReport = '';
                models.Channel.findOne({
                  where: {
                    name: interviewChannel
                  }
                }).then(function(channel) {
                  latestReport = channel.latestReport;
                });
                models.Standup.findOne({
                  where: {
                    channel: interviewChannel,
                    date: timeHelper.getReportFormat(),
                    user: interviewUser
                  }
                }).then(function(standup) {
                  var now = timeHelper.getDisplayFormat();
                  var channelTime = timeHelper.getDisplayFormat(channel.time);
                  if (moment(now, 'hh:mm a Z').isBefore(moment(channelTime, 'hh:mm a Z'))) {
                    log.verbose('Standup info recorded for ' + userRealName);
                    bot.startPrivateConversation({user: interviewUser}, function(response, convo){
                      convo.say({
                        text: 'Thanks! Your standup for <#'+interviewChannel+
                        '> is recorded and will be reported at ' +
                        timeHelper.getDisplayFormat(channel.time) +
                        '.  It will look like:',
                        attachments: [ standupHelper(standup) ]
                      });
                    });
                  } else {
                    log.verbose('Late report from '+userRealName+'; updating previous report');
                    reportHelper(bot, interviewChannel, true, userRealName);
                  }
                });
              });
            });
          } else {
            // something happened that caused the conversation to stop prematurely
          }
        });
      });
    }
  });
};
