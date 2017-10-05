Feature: Start a DM convo when user emoji-reacts to reminder message

  Scenario Outline: I emoji the bot's message in a channel with a standup
    Given the bot is running
    And I am in a room with the bot
    And the bot ID is 'U1234567'
    And the standup is scheduled for 12:00 am
    And it <on-time> before the standup report has run for the day
    When I add an emoji reaction to the bot's reminder message
    Then the bot should start a private message with "<response>"

    Examples:
      | on-time | response     |
      | is      | Hey there!   |
      | is not  | Hey there!   |

  Scenario: I emoji the bot's message in a channel without a standup
    Given the bot is running
    And I am in a room with the bot
    And no standup is scheduled
    When I add an emoji reaction to the bot's reminder message
    Then the bot should not respond
