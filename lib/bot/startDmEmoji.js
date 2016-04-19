'use strict';

var asyncLib = require('async');
var _ = require('underscore');
var log = require('../../getLogger')('create standup');
var models = require('../../models');
var moment = require('moment');
var helpers = require('../helpers');

function startDmEmoji(bot, message) {
  log.verbose('Got an emoji reaction: '+message.reaction+' from '+message.user);
  models.Channel.findOne({
    where: {
      name: message.item.channel
    }
  }).then(function(channel) {
    if (channel) {
      var date = helpers.time.getCurrentDate();
      var yesterday;
      var today;
      var blockers;
      var goal;
      var userRealName;
      var thumbUrl;
      var audience = channel.audience === null ? '<!here>' : '@'+channel.audience.replace('@','') ;
      var pastBlockers = '';
      bot.api.users.info({'user':message.user}, function(err, response) {
        userRealName = response.user.real_name;
        thumbUrl = response.user.profile.image_72;
      });
      models.Standup.findAll({
        where: {
          user: message.user,
          channel: message.item.channel,
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
      bot.startPrivateConversation({user: message.user}, function(response, convo){
        // TODO: consider allowing multi-line responses
        convo.say('Hey there! Let\'s record your standup for <#'+message.item.channel+'>'+
          ' (Say "skip" to skip any of the questions):');
        convo.ask('What did you do yesterday?', function(response, conversation) {
          if (!response.text.match(/skip/ig)) {
            yesterday = response.text;
          } else {
            yesterday = null;
          }
          conversation.next();
        });
        convo.ask('What are you doing today? (Use :pager: if you\'re available'+
        ' for projects)', function(response, conversation) {
          if (!response.text.match(/skip/ig)) {
            today = response.text;
          } else {
            today = null;
          }
          conversation.next();
        });
        convo.ask('What are your blockers?'+pastBlockers, function(response, conversation) {
          if (!response.text.match(/skip/ig)) {
            blockers= response.text;
          } else {
            blockers= null;
          }
          conversation.next();
        });
        convo.ask('Any major goal for the day?', function(response, conversation) {
          if (!response.text.match(/skip/ig)) {
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
                channel: message.item.channel,
                date: helpers.time.getReportFormat(),
                user: message.user
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
                    channel: message.item.channel,
                    date: helpers.time.getReportFormat(),
                    user: message.user
                  }
                }
              ).then(function () {
                var latestReport = '';
                models.Channel.findOne({
                  where: {
                    name: message.item.channel
                  }
                }).then(function(channel) {
                  latestReport = channel.latestReport;
                });
                models.Standup.findOne({
                  where: {
                    channel: message.item.channel,
                    date: helpers.time.getReportFormat(),
                    user: message.user
                  }
                }).then(function(standup) {
                  var now = helpers.time.getDisplayFormat();
                  var channelTime = helpers.time.getDisplayFormat(channel.time);
                  if (moment(now, 'hh:mm a Z').isBefore(moment(channelTime, 'hh:mm a Z'))) {
                    log.verbose('Standup info recorded for ' + userRealName);
                    bot.startPrivateConversation({user: message.user}, function(response, convo){
                      convo.say({
                        text: 'Thanks! Your standup for <#'+message.item.channel+
                        '> is recorded and will be reported at ' +
                        helpers.time.getDisplayFormat(channel.time) +
                        '.  It will look like:',
                        attachments: [ helpers.getStandupReport(standup) ]
                      });
                    });
                  } else {
                    // update posted message

                    // Find standup messages for that channel & for today
                    models.Standup.findAll({
                      where: {
                        channel: message.item.channel,
                        date: date
                      }
                    }).then(function (standups) {
                      // Begin a Slack message for this channel
                      // https://api.slack.com/docs/attachments
                      var update = {
                        ts: latestReport,
                        channel: message.item.channel,
                        text: audience+' Today\'s standup for <#'+channel.name+'>:',
                        attachments: [{
                          title: 'hello'
                        }],
                      };
                      var attachments = [];
                      asyncLib.series([
                        // Iterate over this channels standup messages
                        function(callback) {
                          _.each(standups, function (standup) {
                            console.log(helpers.getStandupReport(standup));
                            attachments.push(helpers.getStandupReport(standup));
                          });
                          callback(null);
                        },
                        // Update the existing report on Slack
                        function(callback) {
                          update.attachments = JSON.stringify(attachments);
                          bot.api.chat.update(update, function(err, response) {
                            if (err) {
                              console.log('Error! '+err);
                            } else {
                              log.verbose('Edited the standup for '+message.item.channel)
                              // console.log(response);
                            }
                          });
                          callback(null);
                        },
                        function(callback) {
                          bot.api.channels.info({'channel':message.item.channel}, function (err, response) {
                            if (err) {
                              console.log(err);
                            } else {
                              var link = 'https://18f.slack.com/archives/'+response.channel.name+
                                '/p'+latestReport.replace('.','');
                              bot.say({
                                channel: message.item.channel,
                                text: ':bell: I\'ve updated the report with a standup from '+
                                  standup.userRealName+': '+link
                              });
                            }
                          });
                          callback(null);
                        }
                      ]);
                    });
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
}

function attachListener(controller, botId) {
  // console.log('1');
  controller.on('reaction_added', function(bot, message) {
    // console.log('2');
    // console.log(message);
    // console.log(botId);
    if (message.item_user === botId) {
      // console.log('3');
      startDmEmoji(bot, message);
    }
  });
}

module.exports = attachListener;
