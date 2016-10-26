Feature: Report standups
  I want the bot to run reports at the prescribed times
  I want the bot not to run reports on holidays

  Scenario: It is not a holiday or weekend
    Given the bot is running
    And it is not a holiday
    When the scheduled time comes
    Then the bot should report

  Scenario: It is a weekend

  Scenario: It is a holiday
    Given the bot is running
    And it is a holiday
    When the scheduled time comes
    Then the bot should not report
