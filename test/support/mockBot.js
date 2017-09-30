const defaultTeamInfoResponse = {
  team: { domain: 'mydomain' }
};

function team(teamInfoResponse) {
  const response = teamInfoResponse || defaultTeamInfoResponse;
  return {
    info: (_, callback) => {
      callback(null, response);
    }
  };
}

const defaultSayResponse = { ts: new Date() };

function say(sayResponse) {
  const response = sayResponse || defaultSayResponse;
  return (report, inCallback) => {
    const callback = inCallback || (() => {});
    callback(null, response);
  };
}

const defaultChannelInfoResponse = {
  channel: { name: 'mychannel' }
};

function channels(channelInfoResponse) {
  const response = channelInfoResponse || defaultChannelInfoResponse;
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

module.exports = (teamInfoResponse, sayResponse, channelInfoResponse) => ({
  api: {
    team: team(teamInfoResponse),
    channels: channels(channelInfoResponse),
    chat: chat()
  },
  say: say(sayResponse)
});

module.exports.defaults = {
  teamInfoResponse: defaultTeamInfoResponse,
  channelInfoResponse: defaultChannelInfoResponse,
  sayResponse: defaultSayResponse
};
