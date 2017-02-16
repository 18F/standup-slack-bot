'use strict';

const _                   = require('underscore');
const standupReport       = require('../getStandupReport');

module.exports = function createAttachments(standups) {
  let attachments = [];

  _.each(standups, function (standup) {
    attachments.push(standupReport(standup));
  });

  return attachments;
};

