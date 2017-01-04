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
        case 'submit_standup':
          submitStandup();
          break;
      }
      return res.send(200);
    }
    res.send(300);
  });
};
