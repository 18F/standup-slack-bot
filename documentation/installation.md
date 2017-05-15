# Installation

## Pre-requisites

NOTE: If you are planning to run `standup-slack-bot`  in docker, please refer to the [Docker](#docker) section below.

Before installing standup-bot, you'll need to have access to a:

- PostgreSQL database; and
- Slack API token

To get a Slack API token, you will need to create a bot integration from the Slack admin panel: <https://your-team.slack.com/apps/manage/custom-integrations> (replace `your-team` with your Slack team name).

## Setting up

```bash
git clone https://github.com/18F/standup-slack-bot.git
cd standup-slack-bot
```

This project is built with Node version 6.7. We recommend [`nvm`](https://github.com/creationix/nvm) to help manage versions of Node on your machine. With that installed, you can install the project's dependencies:

```bash
npm install

# Create and migrate the database
# You will want to do this for each application env:
#     development, test
createdb standup_bot_development # create your postgres database
DATABASE_URL=postgresql://localhost/standup_bot_development npm run migrate
```

To load your own environmental variables copy over the `.env.sample`
file and modify to match your own variable.

    cp .env.sample .env

The variables in use are:

Name         | Description
------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
SLACK_TOKEN  | Slack API token, generated when you created the bot integration on Slack.  This value is required.
DATABASE_URL | The Postgres connection URL for your standup-bot database.  Defaults to `postgres://localhost/standup`.  The specified database must already exist, but it can be empty.
PORT         | The port for the built-in webserver to run on.  This server hosts the bot's API and documentation.  If omitted, the built-in webserver will not run.  If you don't want the webserver, just leave `PORT` out.
TIMEZONE     | The timezone for the bot to use, or defaults to `America/New_York`.  Timezone names must be [supported by moment-timezone](http://momentjs.com/timezone/docs/#/data-loading/getting-zone-names/).
LOG_LEVEL    | Numeric value indicating the log level.  10 is verbose, 20 is info, 30 is warning, and 40 is error-only.  Defaults to 10.

## Running

Once everything is set up, to run standup-bot, simply run `npm start`.

## Docker

To skip all the manual steps above, you can run `standup-slack-bot` in [Docker](https://www.docker.com). The only pre-requisite after [installing docker](https://docs.docker.com/engine/installation/) would be [installing docker-compose](https://docs.docker.com/compose/install/).

Also ensure that your `.env` file has your `SLACK_TOKEN` in it:

    $ echo "SLACK_TOKEN=xoxb-<your slackbot API token>" > .env

only `SLACK_TOKEN` is required in `.env`. The rest of the required env variables are already specified in `docker-compose.yaml`.

Finally, to start with docker-compose:

    $ docker-compose up -d

## Testing

Tests are written in [cucumberjs](https://github.com/cucumber/cucumber-js).  To run them, just `npm test`.
