Feature: Get full user info from an ID

  Scenario: I ask for user info and the network response fails
    Given the network is down
    When I ask for the full user
    Then I receive an error

  Scenario: I ask for user info for an invalid user ID
    Given the network is up
    And I have an invalid user ID
    When I ask for the full user
    Then I receive an error

  Scenario: I ask for user info for a previously unseen user
    Given the network is up
    And I have a valid user ID
    And the user has not been seen before
    When I ask for the full user
    Then I receive a complete user object

  Scenario: I ask for user info for a previously seen user
    Given the network is up
    And I have a valid user ID
    And the user has been seen before
    When I ask for the full user
    Then I receive a complete user object

  Scenario: I ask for user info for a previous seen user and the network response fails
    Given the network is down
    And I have a valid user ID
    And the user has been seen before
    When I ask for the full user
    Then I receive a complete user object
