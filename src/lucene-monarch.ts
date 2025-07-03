import type { editor, languages, IDisposable } from 'monaco-editor';

export interface FieldSchema {
  key: string;
  values: string[];
}

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

// Track if language is already registered
let isLanguageRegistered = false;
let completionProviderDisposable: IDisposable | null = null;

export function registerLuceneLanguage(monaco: typeof import('monaco-editor'), fieldSchema?: FieldSchema[]) {
  // Only register language features once
  if (!isLanguageRegistered) {
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
    
    isLanguageRegistered = true;
  }
  
  // Dispose previous completion provider if it exists
  if (completionProviderDisposable) {
    completionProviderDisposable.dispose();
  }
  
  // Register new completion provider with current schema
  completionProviderDisposable = monaco.languages.registerCompletionItemProvider('lucene', {
    triggerCharacters: [':', ' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const lineText = model.getLineContent(position.lineNumber);
      const textBeforeCursor = lineText.substring(0, position.column - 1);
      
      // Check context for smart suggestions
      const isAfterColon = textBeforeCursor.match(/\w+:$/);
      const isInRange = textBeforeCursor.match(/[[{][^}\]]*$/);
      const isAfterOperator = textBeforeCursor.match(/\b(AND|OR|NOT|&&|\|\||!|\+|-)\s*$/);
      const isAtStart = textBeforeCursor.trim() === '' || isAfterOperator;
      const isTypingField = !isAfterColon && !isInRange && word.word.length > 0;

      // Extract field name from "field:" or "field:value" pattern
      const fieldMatch = textBeforeCursor.match(/(\w+):(\w*)$/);
      const currentField = fieldMatch ? fieldMatch[1] : null;
      const currentValue = fieldMatch ? fieldMatch[2] : '';
      const isTypingAfterColon = currentField && fieldMatch;

      // Calculate proper range for replacement
      let range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      // Adjust range when typing after colon to replace only the value part
      if (isTypingAfterColon && currentValue) {
        const colonIndex = textBeforeCursor.lastIndexOf(':');
        range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: colonIndex + 2, // Start after the colon
          endColumn: position.column,
        };
      }

      const suggestions: monaco.languages.CompletionItem[] = [];

      // Check if we're typing after a field colon for field-specific value suggestions
      if (isTypingAfterColon && fieldSchema) {
        const schemaField = fieldSchema.find(f => f.key === currentField);
        if (schemaField) {
          // Filter values based on what user is typing after colon
          const filteredValues = currentValue 
            ? schemaField.values.filter(value => value.toLowerCase().startsWith(currentValue.toLowerCase()))
            : schemaField.values;
          
          filteredValues.forEach(value => {
            suggestions.push({
              label: value,
              kind: monaco.languages.CompletionItemKind.Value,
              insertText: value,
              documentation: `${currentField} field value`,
              range: range,
            });
          });
          // Return early to show only field-specific values
          return { suggestions };
        }
      }

      // Field name suggestions
      if (isAtStart || isAfterOperator || isTypingField) {
        // Default field names
        const defaultFields = [
          'title', 'author', 'content', 'text', 'date', 'category', 
          'status', 'priority', 'score', 'name', 'description', 'tags'
        ];
        
        // Add custom fields from schema
        const customFields = fieldSchema ? fieldSchema.map(f => f.key) : [];
        const allFields = [...defaultFields, ...customFields];
        
        // Remove duplicates
        const uniqueFields = [...new Set(allFields)];
        
        // Filter fields based on what user is typing
        const filteredFields = isTypingField 
          ? uniqueFields.filter(field => field.toLowerCase().startsWith(word.word.toLowerCase()))
          : uniqueFields;
        
        filteredFields.forEach(field => {
          const isCustomField = fieldSchema?.some(f => f.key === field);
          // Show field values in documentation for custom fields
          const fieldValues = isCustomField ? fieldSchema?.find(f => f.key === field)?.values : [];
          const valuePreview = fieldValues && fieldValues.length > 0 
            ? ` (values: ${fieldValues.slice(0, 3).join(', ')}${fieldValues.length > 3 ? '...' : ''})`
            : '';
          
          suggestions.push({
            label: field,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: field + ':',
            documentation: isCustomField 
              ? `Custom field: ${field}${valuePreview}` 
              : `Search in ${field} field`,
            range: range,
            sortText: isCustomField ? `0${field}` : `1${field}`, // Prioritize custom fields
          });
        });
      }

      // Operator suggestions
      if (!isInRange) {
        const operators = [
          { label: 'AND', doc: 'Boolean AND operator' },
          { label: 'OR', doc: 'Boolean OR operator' },
          { label: 'NOT', doc: 'Boolean NOT operator' },
          { label: '&&', doc: 'Boolean AND operator (alternative)' },
          { label: '||', doc: 'Boolean OR operator (alternative)' },
          { label: '!', doc: 'Boolean NOT operator (alternative)' },
          { label: '+', doc: 'Required term' },
          { label: '-', doc: 'Prohibited term' }
        ];
        
        operators.forEach(op => {
          suggestions.push({
            label: op.label,
            kind: monaco.languages.CompletionItemKind.Operator,
            insertText: op.label + ' ',
            documentation: op.doc,
            range: range,
          });
        });
      }

      // Range query TO keyword
      if (isInRange) {
        suggestions.push({
          label: 'TO',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'TO ',
          documentation: 'Range query separator',
          range: range,
        });
      }

      // Special search patterns
      if (isAfterColon || isAtStart) {
        // Wildcard patterns
        suggestions.push({
          label: '*',
          kind: monaco.languages.CompletionItemKind.Text,
          insertText: '*',
          documentation: 'Wildcard - matches any sequence of characters',
          range: range,
        });

        suggestions.push({
          label: '?',
          kind: monaco.languages.CompletionItemKind.Text,
          insertText: '?',
          documentation: 'Wildcard - matches any single character',
          range: range,
        });

        // Fuzzy search
        suggestions.push({
          label: 'fuzzy search',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '${1:term}~${2:distance}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Fuzzy search with optional edit distance',
          range: range,
        });

        // Proximity search
        suggestions.push({
          label: 'proximity search',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '"${1:phrase}"~${2:distance}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Proximity search - words within specified distance',
          range: range,
        });

        // Boost query
        suggestions.push({
          label: 'boost query',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '${1:term}^${2:boost}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Boost query - increase relevance score',
          range: range,
        });

        // Range queries
        suggestions.push({
          label: 'range inclusive',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '[${1:start} TO ${2:end}]',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Inclusive range query',
          range: range,
        });

        suggestions.push({
          label: 'range exclusive',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '{${1:start} TO ${2:end}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Exclusive range query',
          range: range,
        });

        // Regular expression
        suggestions.push({
          label: 'regex',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '/${1:pattern}/',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Regular expression search',
          range: range,
        });
      }

      // Grouping patterns
      if (isAtStart || isAfterOperator) {
        suggestions.push({
          label: 'group query',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '(${1:query1} OR ${2:query2})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Group queries with parentheses',
          range: range,
        });

        suggestions.push({
          label: 'field group',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '${1:field}:(${2:term1} ${3:term2})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Group multiple terms for a field',
          range: range,
        });
      }

      // Escape characters
      const escapeChars = [
        { char: '\\+', doc: 'Escape plus sign' },
        { char: '\\-', doc: 'Escape minus sign' },
        { char: '\\&', doc: 'Escape ampersand' },
        { char: '\\|', doc: 'Escape pipe' },
        { char: '\\!', doc: 'Escape exclamation' },
        { char: '\\(', doc: 'Escape left parenthesis' },
        { char: '\\)', doc: 'Escape right parenthesis' },
        { char: '\\{', doc: 'Escape left brace' },
        { char: '\\}', doc: 'Escape right brace' },
        { char: '\\[', doc: 'Escape left bracket' },
        { char: '\\]', doc: 'Escape right bracket' },
        { char: '\\^', doc: 'Escape caret' },
        { char: '\\"', doc: 'Escape quote' },
        { char: '\\~', doc: 'Escape tilde' },
        { char: '\\*', doc: 'Escape asterisk' },
        { char: '\\?', doc: 'Escape question mark' },
        { char: '\\:', doc: 'Escape colon' },
        { char: '\\\\', doc: 'Escape backslash' },
        { char: '\\/', doc: 'Escape forward slash' }
      ];

      escapeChars.forEach(esc => {
        suggestions.push({
          label: esc.char,
          kind: monaco.languages.CompletionItemKind.Text,
          insertText: esc.char,
          documentation: esc.doc,
          range: range,
        });
      });

      return { suggestions };
    }
  });
}