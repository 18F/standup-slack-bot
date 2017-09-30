const transformers = require('./transformers');

module.exports = function generateFields(attachments) {
  const fields = [
    transformers.HeardFrom,
    transformers.SharedChannels,
    transformers.Pager,
    transformers.OOO
  ].map(Klass => new Klass(attachments).field());

  return fields.filter(value => !!value);
};
