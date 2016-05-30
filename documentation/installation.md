# Installation

## Pre-requisites

Before installing standup-bot, you'll need to have access to a:

* PostgreSQL database; and
* [Slack API token]().

## Setting up

``` bash
git clone https://github.com/18F/standup-bot.git
cd standup-bot
npm install
```

Then, create a new file `.env` in the base directory with the following variables:

* SLACK_TOKEN
* DATABASE_URL
* PORT

## Running

Once everything is set up, to run standup-bot, simply run `foreman start`.
