

const _ = require('lodash');
const transformers = require('./transformers');

module.exports = function generateFields(attachments) {
  const fields = [
    transformers.HeardFrom,
    transformers.SharedChannels,
    transformers.Pager,
    transformers.OOO
  ].map(Klass => new Klass(attachments).field());

  return _.compact(fields);
};

