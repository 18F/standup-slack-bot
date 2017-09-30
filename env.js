

require('dotenv').config();
const cfenv = require('cfenv');

const appEnv = cfenv.getAppEnv();

const knownEnvs = [
  'SLACK_TOKEN',
  'TIMEZONE',
  'URL'
];

if (appEnv.getServices() && Object.keys(appEnv.getServices()).length) {
  // If running on Cloud Foundry
  for (const env of knownEnvs) {
    process.env[env] = appEnv.getServiceCreds('standup-bot-cups')[env];
  }
}
