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
      | 0830        | should     |

  Scenario Outline: Getting the time in a database-friendly schedule format
    Given the input time <time>
      When I ask for the schedule format
      Then the result matches <pattern>
    Examples:
    | time    | pattern |
    |         | \d{4}   |
    | 8:30 pm | 2030    |

  Scenario Outline: Getting the time in a report-friendly format
    Given the input time <time>
      When I ask for the report format
      Then the result matches <pattern>
    Examples:
    | time    | pattern           |
    |         | \d{4}-\d{2}-\d{2} |
    | 0830    | \d{4}-\d{2}-\d{2} |

  Scenario Outline: Getting the time in a user-friendly display format
    Given the input time <time>
      When I ask for the display format
      Then the result matches <pattern>
    Examples:
    | time    | pattern           |
    |         | \d{2}:\d{2} [ap]m |
    | 0830    | 08:30 am          |
