Feature: Set standup meeting reminders

  Scenario Outline: I try to set a standup reminder in a channel with a standup
    Given the bot is running
    And I am in a room with the bot
    And the standup is scheduled for <utc-time>
    When I say "@bot reminder <time>"
    Then the bot should respond "Got it."

    Examples:
      | utc-time | time | result  |
      | 9:30 am  | 15   | 9:15 am |
      | 10:30 am | 45   | 9:45 am |

  Scenario: I try to set a standup reminder in a channel without a standup
    Given the bot is running
    And I am in a room with the bot
    And no standup is scheduled
    When I say "@bot reminder 15"
    Then the bot should respond "There's no standup scheduled yet."
