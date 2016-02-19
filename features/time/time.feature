Feature: Time Helper
  I want the time helper to parse a time from a string
  I want the time helper to convert a time to a formatted string

  Scenario: Parsing a 3-digit time without colon or AM/PM
    Given the time value 830
    Then it should fail

  Scenario: Parsing a 3-digit time without AM/PM
    Given the time value 8:30
    Then it should fail

  Scenario: Parsing a 3-digit time without colon
    Given the time value 830 am
    Then it should succeed

  Scenario: Parsing a 3-digit time with AM/PM
    Given the time value 8:30 am
    Then it should succeed

  Scenario: Parsing a 4-digit time without colon or AM/PM, greater than 24th hour
    Given the time value 2500
    Then it should fail

  Scenario: Parsing a 4-digit time without colon or AM/PM, less than 24th hour
    Given the time value 0830
    Then it should succeed

  Scenario: Parsing a 4-digit time without AM/PM, greater than 12th hour
    Given the time value 15:00
    Then it should fail

  Scenario: Parsing a 4-digit time without AM/PM, less than 12th hour
    Given the time value 11:00
    Then it should fail

  Scenario: Parsing a 4-digit time, greater than 12th hour
    Given the time value 15:00 am
    Then it should fail

  Scenario: Parsing a 4-digit time, less than 12th hour
    Given the time value 8:30 am
    Then it should succeed
