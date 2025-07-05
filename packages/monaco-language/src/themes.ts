import type { editor } from 'monaco-editor';

export const luceneDarkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'field', foreground: '569CD6' },                    // Blue for field names
    { token: 'field.quoted', foreground: '9CDCFE' },             // Light blue for quoted field names
    { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' }, // Purple for AND/OR/NOT
    { token: 'keyword.range', foreground: 'C586C0' },            // Purple for TO
    { token: 'operator', foreground: 'D4D4D4' },                 // Light gray for +/-
    { token: 'operator.fuzzy', foreground: 'DCDCAA' },          // Yellow for ~
    { token: 'operator.boost', foreground: 'B5CEA8' },          // Light green for ^
    { token: 'operator.wildcard', foreground: 'DCDCAA' },       // Yellow for *?
    { token: 'operator.wildcard.range', foreground: 'DCDCAA' },  // Yellow for range wildcards
    { token: 'operator.comparison', foreground: 'C586C0' },      // Purple for comparison operators
    { token: 'string', foreground: 'CE9178' },                  // Orange for quoted strings
    { token: 'string.proximity', foreground: 'CE9178' },        // Orange for proximity searches
    { token: 'string.escape', foreground: 'D7BA7D' },          // Light brown for escapes
    { token: 'number', foreground: 'B5CEA8' },                 // Light green for numbers
    { token: 'date', foreground: '4FC1FF' },                   // Light blue for dates
    { token: 'regexp', foreground: 'D16969' },                 // Red for regular expressions
    { token: 'identifier', foreground: 'D4D4D4' },             // Light gray for terms
    { token: 'delimiter.colon', foreground: 'D4D4D4' },        // Light gray for colons
    { token: 'delimiter.parenthesis', foreground: 'FFD700' },   // Gold for parentheses
    { token: 'delimiter.square', foreground: 'FFD700' },        // Gold for square brackets
    { token: 'delimiter.curly', foreground: 'FFD700' },         // Gold for curly braces
  ],
  colors: {}
};

export const luceneLightTheme: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'field', foreground: '0451A5' },                    // Darker blue for field names
    { token: 'field.quoted', foreground: '0070C1' },             // Blue for quoted field names
    { token: 'keyword', foreground: 'AF00DB', fontStyle: 'bold' }, // Purple for AND/OR/NOT
    { token: 'keyword.range', foreground: 'AF00DB' },            // Purple for TO
    { token: 'operator', foreground: '2B2B2B' },                 // Dark gray for +/-
    { token: 'operator.fuzzy', foreground: '795E26' },          // Brown for ~
    { token: 'operator.boost', foreground: '008000' },          // Green for ^
    { token: 'operator.wildcard', foreground: '795E26' },       // Brown for *?
    { token: 'operator.wildcard.range', foreground: '795E26' },  // Brown for range wildcards
    { token: 'operator.comparison', foreground: 'AF00DB' },      // Purple for comparison operators
    { token: 'string', foreground: 'A31515' },                  // Red for quoted strings
    { token: 'string.proximity', foreground: 'A31515' },        // Red for proximity searches
    { token: 'string.escape', foreground: 'EE0000' },          // Bright red for escapes
    { token: 'number', foreground: '098658' },                 // Dark green for numbers
    { token: 'date', foreground: '0070C1' },                   // Blue for dates
    { token: 'regexp', foreground: '811F3F' },                 // Dark red for regular expressions
    { token: 'identifier', foreground: '2B2B2B' },             // Dark gray for terms
    { token: 'delimiter.colon', foreground: '2B2B2B' },        // Dark gray for colons
    { token: 'delimiter.parenthesis', foreground: 'B8860B' },   // Dark golden rod for parentheses
    { token: 'delimiter.square', foreground: 'B8860B' },        // Dark golden rod for square brackets
    { token: 'delimiter.curly', foreground: 'B8860B' },         // Dark golden rod for curly braces
  ],
  colors: {}
};