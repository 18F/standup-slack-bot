Feature: Send standup to the bot

  Scenario Outline: I try to send a standup
    Given the bot is running
    And I want to send a standup for a <visibility> channel
    And the channel <status> have a standup
    When I DM the bot with standup
      """
      Y: yesterday
      T: today
      B: blockers
      G: goal
      
      """
    Then the bot should respond with "<response>"

    Examples:
      | visibility | status   | response |
      | public     | does     | Thanks   |
      | public     | does not | channel doesn't have any standups set |
      | private    | does     | only work with public channels |
      | private    | does not | only work with public channels |
