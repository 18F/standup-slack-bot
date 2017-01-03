Feature: Get usage help

  Scenario: I ask for help in a channel
    Given the bot is running
    And I am in a room with the bot
    When I say "@bot help"
    Then the bot should upload a post

  Scenario: I ask for help in a DM
    Given the bot is running
    And I am in a room with the bot
    When I DM the bot with "help"
    Then the bot should upload a post
