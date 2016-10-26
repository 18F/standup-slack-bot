# Standup Reports

The bot will automatically report into a channel at the specified time on weekdays and non-holidays (US federal holidays as defined by OPM).  A report consists of a summary with the number of people who submitted standups, a list of common projects, and a list of people who have indicated they will be out of the office today, followed by the list of individual standups.

## Manual Reports

You can also request reports at any time.  To get today's report for a channel to run again, in that channel, say:

`@standup-bot report`

For finer-grained reporting, you can send a DM to the bot.  With this method, you must specify a channel and optionally a user (default is yourself) and number of days (default is one week) to report.  For example:

Message                   | Output
------------------------- | ---------------------------------------------------------------------------------
`report #channel`         | This will report your standups for `#channel` for the past week
`report #channel @user`   | This will report the standups from `@user` for `#channel` for the past week
`report #channel @user 3` | This will report the standups from `@user` for `#channel` for the past three days
