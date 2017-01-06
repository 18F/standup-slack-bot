const request = require('request');
const server = require('express')();
require('./env');

server.get('/oauth', (req, res) => {
  // TODO: only accept oauth messages from our team
  request(`https://slack.com/api/oauth.access?client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&code=${req.query.code}`, (_err, _res, body) => {
    const auth = JSON.parse(body);
    if(auth.ok && auth.team_id === 'T2JPFV3U4' && auth.bot) {
      console.log(`Bot access token:\n${auth.bot.bot_access_token}`);
      res.send('Okie dokie');
    } else {
      res.sendStatus(400);
    }
  });
});

server.listen(process.env.PORT);
