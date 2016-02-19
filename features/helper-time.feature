Feature: Time Helper, parsing a string
  I want the time helper to parse a time from a string
  I want the time helper to convert a time to a formatted string

  Scenario Outline: Parsing a string to a time
    Given the string <time_string>
      When I try to parse it
      Then the time <status> parse

  Examples:
    | time_string | status     |
    | 830         | should not |
    | 8:30        | should not |
    | 830am       | should     |
    | 830 am      | should     |
    | 8:30am      | should     |
    | 8:30 am     | should     |
    | 830pm       | should     |
    | 830 pm      | should     |
    | 8:30pm      | should     |
    | 8:30 pm     | should     |
    | 830AM       | should     |
    | 830 AM      | should     |
    | 8:30AM      | should     |
    | 8:30 AM     | should     |
    | 830PM       | should     |
    | 830 PM      | should     |
    | 8:30PM      | should     |
    | 8:30 PM     | should     |
    | 11:30       | should not |
    | 1130am      | should     |
    | 1130 am     | should     |
    | 11:30am     | should     |
    | 11:30 am    | should     |
    | 1130pm      | should     |
    | 1130 pm     | should     |
    | 11:30pm     | should     |
    | 11:30 pm    | should     |
    | 1130AM      | should     |
    | 1130 AM     | should     |
    | 11:30AM     | should     |
    | 11:30 AM    | should     |
    | 1130PM      | should     |
    | 1130 PM     | should     |
    | 11:30PM     | should     |
    | 11:30 PM    | should     |
    | 2500        | should not |
    | 2400        | should     |
    | 0830        | should     |
    | 0830am      | should     |
    | 0830 am     | should     |
    | 0830pm      | should     |
    | 0830 pm     | should     |
    | 0830AM      | should     |
    | 0830 AM     | should     |
    | 0830PM      | should     |
    | 0830 PM     | should     |
    | 1130        | should     |
    | 1130am      | should     |
    | 1130 am     | should     |
    | 1130pm      | should     |
    | 1130 pm     | should     |
    | 1130AM      | should     |
    | 1130 AM     | should     |
    | 1130PM      | should     |
    | 1130 PM     | should     |
    | 0000        | should     |
    | 13:00       | should not |
    | 13:00 am    | should     |
