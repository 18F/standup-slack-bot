Feature: Create standup meetings on a recurring basis
  I want to be able to schedule daily standups
  I want to be able to schedule weekly standups

  Scenario Outline: I try to create a daily standup
    Given the bot is running
    And I am in a room with the bot
    When I say "@bot create standup daily at <time>"
    Then the bot should respond "Got it"

    Examples:
      | time |
      | 0830 |

  Scenario Outline: I try to create a weekly standup
    Given the bot is running
    And I am in a room with the bot
    When I say "@bot create standup weekly on <day> at <time>"
    Then the bot should respond "Got it"

    Examples:
      | day      | time |
      | Thursday | 0830 |
