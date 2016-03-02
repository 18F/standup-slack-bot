Feature: Create standup meetings on a recurring basis

  Scenario Outline: I try to create a standup
    Given the bot is running
    And I am in a room with the bot
    When I say "@bot create standup at <time>"
    Then the bot should respond "Got it"

    Examples:
      | time |
      | 0830 |
