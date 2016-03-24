Feature: Create standup meetings on a recurring basis

  Scenario Outline: I try to create a standup
    Given the bot is running
    And I am in a room with the bot
    When I say "@bot create standup at <time>"
    Then the bot should respond "<response-start>"

    Examples:
      | time | response-start                                |
      | 0830 | Got it                                        |
      | 130  | :x: Sorry, I couldn't understand that message |

  Scenario Outline: I try to create a standup
    Given the bot is running
    And I am in a private room with the bot
    When I say "@bot create standup at <time>"
    Then the bot should respond "I can only work with public channels"

    Examples:
      | time |
      | 0830 |
