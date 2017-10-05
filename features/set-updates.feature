Feature: Set in-channel report updates

  Scenario Outline: I try to toggle in-channel report updates
    Given the bot is running
    And I am in a room with the bot
    And the standup is scheduled for <utc-time>
    When I say "@bot <toggle> updates"
    Then the bot should respond "Okay, I <will-or-wont> update the channel with late reports"

    Examples:
      | utc-time | toggle         | will-or-wont  |
      | 9:30 am  | enable         | will          |
      | 9:30 am  | please enable  | will          |
      | 10:30 am | disable        | won't         |
      | 10:30 am | please disable | won't         |
