[![Build Status](https://travis-ci.org/18F/standup-bot.svg?branch=develop)](https://travis-ci.org/18F/standup-bot)
[![codecov.io](https://codecov.io/github/18F/standup-bot/coverage.svg?branch=develop)](https://codecov.io/github/18F/standup-bot?branch=develop)
[![Code Climate](https://codeclimate.com/github/18F/standup-bot/badges/gpa.svg)](https://codeclimate.com/github/18F/standup-bot)
[![Dependencies](https://david-dm.org/18f/standup-bot.svg)](https://david-dm.org/18f/standup-bot)

# standup-bot

A Slack bot to streamline team standup without disturbing the overall flow of conversation.

### Usage

To create a standup, invite the bot into a channel or group and tell it when your standup is:

```
@standup-bot schedule standup for 10am daily
```

Then, in a DM with the bot, tell it what's up:

```
standup #my-channel
y: [what you did]
t: [what you'll do]
b: [what's in the way]
g: [your goal]
```

The bot will compile everybody's reports into one standup report that is posted to the channel at the set time.

### Installation

First, set things up:

```
git clone git@github.com:18F/standup-bot.git
cd standup-bot
npm install
```

Then, put your Slack token into `.env` like this:

```
SLACK_TOKEN=xoxb-YOUR-SLACK-TOKEN
```

The app looks for a PostgreSQL database named `standup`. If you'd like to set something else up, add a `DATABASE_URL` entry to the `.env` file.

### Public domain

This project is in the worldwide [public domain](LICENSE.md).   As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within   the United States, and copyright and related rights in the work worldwide are waived through   the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).  
>
> All contributions to this project will be released under the CC0 dedication. By submitting a   pull request, you are agreeing to comply with this waiver of copyright interest.
