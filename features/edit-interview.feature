Feature: Send standup to the bot

  Scenario: I try to edit a standup
    Given the bot is running
    And I want to send a standup for a public channel
    And the channel does have a standup
    And I have previous standups
    When I DM the bot with valid standup edit
    Then the bot should start a private message with ":thumbsup: You bet!"

  Scenario: I try to edit a standup without an existing standup
    Given the bot is running
    And I want to send a standup for a public channel
    And the channel does have a standup
    And I do not have previous standups
    When I DM the bot with valid standup edit
    Then the bot should start a private message with ":thinking_face: It seems"

  Scenario Outline: I try to edit a standup in an invalid manner
    Given the bot is running
    And I want to send a standup for a <visibility> channel
    And the channel <status> have a standup
    And I have previous standups
    When I DM the bot with invalid standup edit
    Then the bot should respond "<response>"

    Examples:
      | visibility | status   | response |
      | public     | does not | channel doesn't have any standups set |
      | private    | does     | only work with public channels |
      | private    | does not | only work with public channels |
