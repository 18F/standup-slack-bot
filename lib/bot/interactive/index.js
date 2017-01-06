const log = require('../../../getLogger')('interactive message');

const standupConfig = require('./standup-config');
const reminderStartInterview = require('./reminder-start-interview');
const reminderSetOOO = require('./reminder-set-ooo');
const slashStandup = require('./slash-standup');

module.exports = {
  interactive: (controller, bot) => {
    // Handle message buttons
    controller.on('interactive_message_callback', (_bot, message) => {
      // Botkit spawns a new bot object when calling this handler, and that
      // new bot object doesn't have the auth credentials of the global bot.
      // To deal with that, ignore the new bot and pass the global bot down
      // into the real handlers.

      // Make sure the message came from our team.
      if(message.team.id !== bot.team_info.id) {
        return;
      }

      // callback_id refers to a message attachment with actions in it,
      // so a callback_id is basically a group of buttons.  The text
      // then tells you which button in that group was pressed.
      switch(message.callback_id) {

        // Standup configuration buttons
        case 'create_standup_config':
          standupConfig.edit(bot, message);
          break;
        case 'create_standup_submit':
          standupConfig.submit(bot, message);
          break;

        // Reminder messages.
        case 'standup_reminder':
          {
            switch(message.text) {
              case 'start_interview':
                reminderStartInterview(bot, message);
                break;

              case 'set_ooo':
                setUserOOO(bot, message);
                break;
            }
          }
          break;

        default:
          log.info(`Unhandled interactive message: callback ID "${message.callback_id}", text "${message.text}"`);
          break;
      }
    });

    // Handle slash commands
    controller.on('slash_command', (slashCommand, message) => {
      // Make sure the message came from our team.
      if(message.team_id !== bot.team_info.id) {
        return;
      }

      switch(message.command) {
        case '/standup':
          slashStandup(slashCommand, message);
          break;

        default:
          slashCommand.replyPrivate(message, `I don't know how to respond to \`${message.command}\`!`);
          break;
      }
    });

    log.verbose('attached');
  }
};
