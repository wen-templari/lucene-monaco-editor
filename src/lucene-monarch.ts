import type { editor, languages } from 'monaco-editor';

export const luceneLanguageDefinition: languages.IMonarchLanguage = {
  defaultToken: '',
  ignoreCase: false,
  
  keywords: [
    'AND', 'OR', 'NOT', 'TO'
  ],

  operators: [
    '+', '-', '~', '^', '?', '*', '&&', '||', '!'
  ],

  brackets: [
    { open: '(', close: ')', token: 'delimiter.parenthesis' },
    { open: '[', close: ']', token: 'delimiter.square' },
    { open: '{', close: '}', token: 'delimiter.curly' }
  ],

  tokenizer: {
    root: [
      // Regular expressions
      [/\/([^/\\]|\\.)*\//, 'regexp'],
      
      // Field queries (field:value)
      [/[a-zA-Z_][a-zA-Z0-9_.-]*(?=:)/, 'field'],
      [/:/, 'delimiter.colon'],
      
      // Boolean operators (both forms)
      [/\b(AND|OR|NOT)\b/, 'keyword'],
      [/&&/, 'keyword'],
      [/\|\|/, 'keyword'],
      [/!(?=\S)/, 'keyword'],
      [/\b(TO)\b/, 'keyword.range'],
      
      // Required/prohibited operators
      [/[+-](?=\S)/, 'operator'],
      
      // Quoted phrases with proximity
      [/"([^"\\]|\\.)*"~\d+/, 'string.proximity'],
      [/"([^"\\]|\\.)*"/, 'string'],
      
      // Range queries - inclusive and exclusive
      [/\[/, { token: 'delimiter.square', next: '@rangeInclusive' }],
      [/\{/, { token: 'delimiter.curly', next: '@rangeExclusive' }],
      
      // Fuzzy search with optional similarity
      [/~\d*\.?\d*/, 'operator.fuzzy'],
      
      // Boost operator with optional decimal
      [/\^\d*\.?\d*/, 'operator.boost'],
      
      // Wildcards
      [/[*?]/, 'operator.wildcard'],
      
      // Grouping parentheses
      [/[()]/, '@brackets'],
      
      // Numbers (including decimals and scientific notation)
      [/\d+\.?\d*([eE][+-]?\d+)?/, 'number'],
      
      // Date formats (common in Lucene)
      [/\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2}))?/, 'date'],
      
      // Escaped characters
      [/\\[\\+!(){}[\]^"~*?:|&/-]/, 'string.escape'],
      
      // Regular terms (including dots and hyphens)
      [/[a-zA-Z_][a-zA-Z0-9_.-]*/, 'identifier'],
      
      // Whitespace
      [/\s+/, 'white'],
      
      // Any other character
      [/./, 'text']
    ],
    
    rangeInclusive: [
      [/\]/, { token: 'delimiter.square', next: '@pop' }],
      [/TO/, 'keyword.range'],
      [/\d+\.?\d*([eE][+-]?\d+)?/, 'number'],
      [/\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2}))?/, 'date'],
      [/[a-zA-Z_][a-zA-Z0-9_.-]*/, 'identifier'],
      [/\s+/, 'white'],
      [/./, 'text']
    ],
    
    rangeExclusive: [
      [/\}/, { token: 'delimiter.curly', next: '@pop' }],
      [/TO/, 'keyword.range'],
      [/\d+\.?\d*([eE][+-]?\d+)?/, 'number'],
      [/\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2}))?/, 'date'],
      [/[a-zA-Z_][a-zA-Z0-9_.-]*/, 'identifier'],
      [/\s+/, 'white'],
      [/./, 'text']
    ]
  }
};

export const luceneTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'field', foreground: '569CD6' },                    // Blue for field names
    { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' }, // Purple for AND/OR/NOT
    { token: 'keyword.range', foreground: 'C586C0' },            // Purple for TO
    { token: 'operator', foreground: 'D4D4D4' },                 // Light gray for +/-
    { token: 'operator.fuzzy', foreground: 'DCDCAA' },          // Yellow for ~
    { token: 'operator.boost', foreground: 'B5CEA8' },          // Light green for ^
    { token: 'operator.wildcard', foreground: 'DCDCAA' },       // Yellow for *?
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

export function registerLuceneLanguage(monaco: typeof import('monaco-editor')) {
  // Register the language
  monaco.languages.register({ id: 'lucene' });
  
  // Set the tokenizer
  monaco.languages.setMonarchTokensProvider('lucene', luceneLanguageDefinition);
  
  // Define the theme
  monaco.editor.defineTheme('lucene-theme', luceneTheme);
  
  // Configure language features
  monaco.languages.setLanguageConfiguration('lucene', {
    brackets: [
      ['(', ')'],
      ['[', ']'],
      ['{', '}']
    ],
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '[', close: ']' },
      { open: '{', close: '}' },
      { open: '"', close: '"' }
    ],
    surroundingPairs: [
      { open: '(', close: ')' },
      { open: '[', close: ']' },
      { open: '{', close: '}' },
      { open: '"', close: '"' }
    ]
  });
}