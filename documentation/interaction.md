# Interacting with the bot

 Many non-administrative interactions with the bot can be triggered by sending a direct message (DM) to the bot or by mentioning the bot by name.  Sometimes, mentioning the bot in a channel is a shortcut since you don't have to tell the bot what channel you're talking about.

## Standup info

To find out when the standup is scheduled for a channel, from that channel, say:

`@standup-bot when`

The bot will let you know if there's not a standup scheduled yet.

## Submit your standup

There are two ways to submit your standup to the bot.  The preferred way is via the interview process.  There are a couple of ways to trigger the interview.  You can add an emoji response to one of the bot's messages (for example, its reminder message), or you can say `@standup-bot interview` in the channel.

During the interview, the bot will ask you a series of questions.  If you want to skip a question, just respond to it with `skip`.  You can also abandon your standup at any time by responding with `exit`.

The other way to submit your standup is with block text.  You can submit your entire standup in a single message by sending a DM to the bot of the form:

```
standup #channel
Y: yesterday's info
T: today's info
B: blockers
G: goals
```

All of the sections (Y/T/B/G) are optional, but the channel name is required.

Once the bot has accepted your standup, it will display the standup back to you if it has not yet reported for that channel (if it has already reported, it will let you know that it is updating the report).

## Editing your standup

There are a few ways to edit your standup after you've submitted it.  You can run the interview again by adding another emoji reaction to the bot's message or saying `@standup-bot interview` again (if you're happy with certain sections, you can `skip` them to keep them the same).

You can also ask the bot to let you edit one section.  In a DM say, `#channel edit today` and the bot will start an interview, showing you your previous response and asking you for a new one.

If you sent your standup as block text, you can edit that message to edit your standup.

Finally, you can send the bot another block text DM.  Any sections you supply in the new standup block text will overwrite the previous standup.

## Setting yourself out-of-office

If you know you'll be out of the office for a few days and would like the bot to automatically post standups on your behalf while you're away, you can tell it you'll be gone.  To do that, you can either tell the bot in the channel that you want to automatically report in:

```
@standup-bot I'll be out of the office for 3 days
```

Or you can send the bot a DM and tell it which channel to automatically report in:

```
#channel out of the office for 3 days
```

The bot understands other variations of these messages.  Here are some examples:

```
@standup-bot out of office 3 days
@standup-bot out of office 3
@standup-bot ooo 3
```

## Get help

The bot can provide a quick reference to using it.  To trigger the bot's in-Slack help, just say `help` in a DM or `@standup-bot help` in any channel the bot is in.
