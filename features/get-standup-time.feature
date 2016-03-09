Feature: Find out when the next standup is

  Scenario Outline: I ask for the standup time in a channel with a standup
    Given the bot is running
    And I am in a room with the bot
    And the standup is scheduled for <utc-time>
    When I say "@bot when"
    Then the bot should respond "There's a standup scheduled for <est-time> EST"

    Examples:
      | utc-time | est-time |
      | 9:30 am  | 4:30 am  |
      | 10:30 am | 5:30 am  |
      | 2:30 pm  | 9:30 am  |
      | 10:30 pm | 5:30 pm  |

  Scenario: I ask for the standup time in a channel without a standup
    Given the bot is running
    And I am in a room with the bot
    And no standup is scheduled
    When I say "@bot when"
    Then the bot should respond "There's no standup scheduled yet."
