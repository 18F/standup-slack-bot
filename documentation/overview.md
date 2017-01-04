{{full_help}}
## Creating a standup

To create a standup, I must be in a channel - you can invite me with
`/invite @{{bot_name}}`.  Then, in that channel, say:

```
@{{bot_name}} create standup <time> [days]
```

The time is required and will be assumed to be in the
{{timezone}} timezone.  Days are optional - if omitted, the standup will
run every weekday.  If provided, days should be separated by spaces.  For
example:

```
@{{bot_name}} create standup 10:30am Monday Wednesday Friday
```

* To create a reminder for a standup, you can just tell me `@{{bot_name}} reminder <minutes before standup>`
* By default, I don't use any @-notices when posting the standup reminder, but you can set an audience that should be notified by saying `@{{bot_name}} audience <target>`. The target can be `@here`, `@channel`, `@<user-group>`, etc.
* To remove an existing standup, message me from the channel where the standup is currently scheduled with `@{{bot_name}} remove standup`

---

## Submitting your standup

If I'm configured to send a reminder, you can just add an emoji
response to my reminder message (or any of my other messages) and I
will start an interview with you via DM.  You can also DM me just
the channel name to start the interview.

You can also send me your standup in a single message by sending me
a DM like this:

```
#channel-name
y: what you did yesterday
t: what you did today
b: what's in your way (blockers)
g: what main thing you hope to accomplish (goal)
```
