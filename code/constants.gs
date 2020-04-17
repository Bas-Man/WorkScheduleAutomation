const months = {"January":2,"February":7,"March":12,"April":17,"May":22,"June":27,"July":32,"August":37,"September":42,"October":47,"November":52,"December":57};

const basic_lessons = ["Private", "Method", "OutService", "Office"];

// Regular Expression Patterns
const trvl_blk_regex = /(?<startTime>\d{2}:\d{2})\s(?:AM|PM)\s-\s(?<endTime>\d{2}:\d{2})\s(?:AM|PM)\s[(](?<count>\d{1,2})\sUnit[s]?[)]\s?\r?\n(?=Type)Type:\s(?<type>\w+)\r?\n(?=Comment)Comments:\s(?<comment>(?:(?![-]{20}).)*)/ig;
const lessons_pv_regex_nonzoom = /(?<startTime>\d{2}:\d{2})\s(?:AM|PM)\s-\s(?<endTime>\d{2}:\d{2})\s(?:AM|PM)\s[(](?<count>\d{1,2})\sUnit[s]?[)]\s?\r?\n(?:(?=Location)Location:\s(?<location>\w+)(?:\s[(]Room\s[N]?\d{1,2}[)])?|(?!Location)(?=Class)Class:\s(?<class>(?:(?!\n).)*))\r?\nType:\s(?<type>(?:(?!\n).)*)\r?\n(?:(?=Material)Material:\s(?<material>(?:(?!\n).)*)\r?\n|(?!Material))(?:(?=Comment)Comments:\s(?<comment>(?:(?!\r?\n).)*(?:\r?\n)?(?:(?!-{20}).)*)|(?!Comments))/ig;
const lessons_pv_regex = /(?<startTime>\d{2}:\d{2})\s(?:AM|PM)\s-\s(?<endTime>\d{2}:\d{2})\s(?:AM|PM)\s[(](?<count>\d{1,2})\sUnit[s]?[)]\s?\r?\n(?:(?=Location)Location:\s(?<location>\w+)(?:\s[(]Room\s[N]?\d{1,3}[)])?|(?!Location)(?=Class)Class:\s(?<class>(?:(?!\n).)*))\r?\n(?:(?=-- Delivered)-- Delivered via (?<zoom>Zoom) --\r?\n|(?!Delivered))Type:\s(?<type>(?:(?!\n).)*)\r?\n(?:(?=Material)Material:\s(?<material>(?:(?!\n).)*)\r?\n|(?!Material))(?:(?=Comment)Comments:\s(?<comment>(?:(?!\r?\n).)*(?:\r?\n)?(?:(?!-{20}).)*)|(?!Comment))/gi;
const date_regex = /(?<day>\w+)\s(?<month>\w+)\s(?<date>\d{1,2})(?:st|nd|rd|th),\s(?<year>\d{4})$/mi;


