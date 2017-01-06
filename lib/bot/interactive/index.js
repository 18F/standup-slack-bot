const log = require('../../../getLogger')('interactive message');

const submitStandup = require('./submitStandup');
const setUserOOO = require('./setUserOOO');

module.exports = {
  interactive: (controller, bot) => {
    controller.on('interactive_message_callback', (_bot, message) => {
      if(message.team.id !== bot.team_info.id) {
        return;
      }

      switch(message.callback_id) {
        case 'start_standup_interview':
          {
            switch(message.text) {
              case 'start_interview':
                submitStandup(bot, message);
                break;

              case 'start_interview_ooo':
                setUserOOO(bot, message);
                break;
            }
          }
          break;

        default:
          break;
      }
    });
    log.verbose('attached');
  }
};
