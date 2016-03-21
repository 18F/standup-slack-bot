Feature: Remind about standups

  Scenario: It is time for a reminder
    Given the bot is running
    And it is not a holiday
    When the reminder time comes
    Then the bot should send a reminder
