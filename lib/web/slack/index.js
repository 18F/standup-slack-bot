const submitStandup = require('./submitStandup.js');

module.exports = function(server, bot) {
  server.post('/slack/interactive-messages', function(req, res) {
    if(req.body) {
      if(typeof req.body === 'string') {
        req.body = JSON.parse(req.body);
      }
      if(typeof req.body === 'object') {
        if(req.body.payload) {
          if(typeof req.body.payload === 'string') {
            req.body = JSON.parse(req.body.payload);
          } else if(typeof req.body.payload === 'object') {
            req.body = req.body.payload;
          }
        }
      }
    }

    if(typeof req.body === 'object' && req.body.token === process.env.SLACK_VERIFICATION_CODE) {
      switch(req.body.callback_id) {
        case 'start_standup_interview':
          submitStandup(bot, req.body.channel.id, req.body.user.id);
          break;
        default:
          return res.sendStatus(300);
          break;
      }
      return res.send({ replace_original: false, delete_original: false, text: 'Gotcha' });
    }

    res.sendStatus(300);
  });
};
