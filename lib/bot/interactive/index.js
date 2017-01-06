const log = require('../../../getLogger')('interactive message');

const submitStandup = require('./submitStandup');

module.exports = {
  interactive: (controller, bot) => {
    controller.on('interactive_message_callback', (_bot, message) => {
      switch(message.callback_id) {
        case 'start_standup_interview':
          submitStandup(bot, message);
          break;

        default:
          break;
      }
    })
    log.verbose('attached');
  }
};
