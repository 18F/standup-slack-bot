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
      | 0830 M W F  | should     |

  # The following scenarios match patterns instead of values
  # known ahead of time.  To match a pattern, they use a
  # "regular expression" to define what they expect.  A good
  # primer on regular expression is available at:
  #
  # http://www.agillo.net/regex-primer-part-1/
  #
  # In a nutshell, these mostly match to digits, using the
  # \d metacharacter.  \d means "one digit", and curly
  # braces indicate a number of times one digit should
  # occur.  So, \d{4} means four digits.
  #
  # Because the database-friendly format is UTC, 9:30 pm
  # should come back as either 0130 during standard
  # time or 0230 during daylight savings time.  The
  # square brackets mean "any one of these characters",
  # so [12] means to match either a 1 or a 2, so this
  # pattern matches 0130 and 0230.

  Scenario Outline: Getting the time in a database-friendly schedule format
    Given the input time <time>
      When I ask for the schedule format
      Then the result matches <pattern>
    Examples:
    | time    | pattern |
    |         | \d{4}   |
    | 9:30 am | 0930    |
    | 9:30 pm | 2130    |

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
    | time    | pattern                    |
    |         | \d{1,2}:\d{2} [ap]m E[SD]T |
    | 0830    | 8:30 am E[SD]T             |

  Scenario Outline: Calculating the reminder time
    Given the database time <time>
      When I set a reminder for <number> minutes
      Then the result is <result>
    Examples:
    | time | number | result |
    | 1230 | 15     | 1215   |
    | 0830 | 45     | 0745   |
