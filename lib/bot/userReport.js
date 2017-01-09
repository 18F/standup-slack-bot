'use strict';

var asyncLib = require('async');
var _ = require('underscore');
var models = require('../../models');
var helpers = require('../helpers');
const messageBuilder = require('./message-builders');
var log = require('../../getLogger')('user report');
const channelRegex = /<#(\S+?)(\|\S*?)?>/;

function userReport(bot, message) {
  log.verbose('Got a request for a user report');
  var channel = channelRegex.test(message.text) ? message.text.match(channelRegex)[1] : message.channel;
  var user = /<@U\w+>/.test(message.text) ? message.text.match(/<@(U\w+)>/)[1] : message.user;
  var days = /\s\d+(\s|$)/.test(message.text) ? message.text.match(/\s(\d+)(\s|$)/)[1] : 7;
  models.Standup.findAll({
    where: {
      channel: channel,
      user: user,
      createdAt: {
        $gt: new Date(new Date() - days * 24 * 60 * 60 * 1000)
      }
    }
  }).then(function (standups) {
    // Begin a Slack message for this channel
    // https://api.slack.com/docs/attachments
    var report = {
      attachments: [],
      channel: channel
    };
    var attachments = [];
    asyncLib.series([
      // Iterate over this channels standup messages
      function(callback) {
        _.each(standups, function (standup) {
          attachments.push(messageBuilder.standupReport.getStandupReportAttachment(standup, helpers.time.getReportFormat(standup.date)));
        });
        callback(null);
      },

      function(callback) {
        // Create summary statistics
        var fields = [];

        // Find common channels
        var regex = /<#\w+>/g;
        var search;
        var results = {};
        var commonChannels = '';
        while ((search = regex.exec(JSON.stringify(attachments))) !== null) {
          if (results[search[0]]) {
            results[search[0]] += 1;
          } else {
            results[search[0]] = 1;
          }
        }
        for (var i in results) {
          if (results[i] > 1) {
            // common[i] = results[i];
            commonChannels += '- ' + i + ' ('+results[i]+')\n';
          }
        }

        // Find total number of standups
        var length = attachments.length;

        // Assemble stats
        fields.push({
          title: 'Days reported',
          value: length,
          short: true
        });
        if (commonChannels.length >= 1) {
          fields.push({
            title: 'Common projects',
            value: commonChannels,
            short: false
          });
        }

        // Add starter attachment
        attachments.unshift({
          fallback: 'Report for '+user+' in '+channel,
          title: 'Summary',
          fields: fields
        });
        callback(null);
      },

      // Send that report off to Slack
      function(callback) {
        report.attachments = attachments;
        bot.reply(message, report, function(err, response) {
          if (err) {
            console.log(err);
          }
        });
        callback(null);
      }
    ]);
  });
}

function attachListener(controller) {
  controller.hears(['^report'],['direct_mention','direct_message'], userReport);
  log.verbose('Attached');
}

module.exports = attachListener;
