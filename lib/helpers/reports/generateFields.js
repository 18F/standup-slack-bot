'use strict';

const _            = require('lodash');
const transformers = require('./transformers');

module.exports = function generateFields(attachments) {
  let fields = [
    transformers.HeardFrom,
    transformers.SharedChannels,
    transformers.Pager,
    transformers.OOO
  ].map((Klass) => {
    return new Klass(attachments).field();
  });

  return _.compact(fields);
};

