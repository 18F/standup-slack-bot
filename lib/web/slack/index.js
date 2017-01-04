const submitStandup = require('./submitStandup.js');

module.exports = function(server) {
  server.post('/slack/interactive-messages', function(req, res) {
    if(typeof req.body === 'object' && req.body.token === process.env.SLACK_VERIFICATION_CODE) {
      switch(req.body.callback_id) {
        case 'submit_standup':
          submitStandup();
          break;
      }
      return res.send(200);
    }
    res.send(300);
  });
};
