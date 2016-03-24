Feature: Remove scheduled standup meetings

  Scenario Outline: I try to remove a standup
    Given the bot is running
    And I am in a room with the bot
    And the channel <status> have a standup
    When I say "@bot remove standup"
    Then the bot should respond "<response>"

    Examples:
      | status   | response                                      |
      | does     | Standup removed :thumbsup:                    |
      | does not | This channel doesn't have a standup scheduled |
