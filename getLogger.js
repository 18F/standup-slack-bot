

const Logger = require('@erdc-itl/simple-logger');

Logger.setOptions({
  level: (process.env.LOG_LEVEL || 10),
  console: true
});

module.exports = function getLogger(name) {
  return new Logger(name);
};
