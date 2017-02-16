'use strict';

const defaultTeamInfoResponse = {
  team: { domain: 'mydomain'}
};

function team(teamInfoResponse) {
  let response = teamInfoResponse || defaultTeamInfoResponse;
  return {
    info: (_, callback) => {
      callback(null, response);
    }
  };
}

const defaultSayResponse = { ts: new Date() };

function say(sayResponse) {
  var response = sayResponse || defaultSayResponse;
  return (report, callback) => {
    callback = callback || function() {};
    callback(null, response);
  };
}

const defaultChannelInfoResponse = {
  channel: {name: 'mychannel'}
};

function channels(channelInfoResponse) {
  let response = channelInfoResponse || defaultChannelInfoResponse;
  return {
    info: (report, callback) => {
      callback(null, response);
    }
  };
}

function chat() {
  return {
    update: (_, callback) => {
      callback();
    }
  };
}

module.exports = function(teamInfoResponse, sayResponse, channelInfoResponse) {
  return {
    api: {
      team:     team(teamInfoResponse),
      channels:  channels(channelInfoResponse),
      chat:     chat()
    },
    say: say(sayResponse),
  };
};

module.exports.defaults = {
  teamInfoResponse: defaultTeamInfoResponse,
  channelInfoResponse: defaultChannelInfoResponse,
  sayResponse: defaultSayResponse
};
