import type { editor, languages, IDisposable } from 'monaco-editor';

export interface FieldSchema {
  key: string;
  values: string[];
}

// Simple syntax tree node types for context analysis
interface SyntaxNode {
  type: 'field' | 'operator' | 'value' | 'group' | 'range';
  value: string;
  position: { start: number; end: number };
  children?: SyntaxNode[];
}

// Parse query into basic syntax tree for context-aware completions
function parseQueryContext(query: string, cursorPos: number): {
  currentNode: SyntaxNode | null;
  parentNode: SyntaxNode | null;
  isInField: boolean;
  isInValue: boolean;
  isInRange: boolean;
  isInGroup: boolean;
} {
  const tokens = tokenizeQuery(query);
  const currentNode: SyntaxNode | null = null;
  const parentNode: SyntaxNode | null = null;
  
  // Find the token containing the cursor position
  const cursorToken = tokens.find(token => 
    cursorPos >= token.start && cursorPos <= token.end
  );
  
  // Analyze context based on cursor position
  const isInField = cursorToken?.type === 'field';
  const isInValue = cursorToken?.type === 'value';
  const isInRange = tokens.some(token => 
    token.type === 'range' && 
    cursorPos >= token.start && cursorPos <= token.end
  );
  const isInGroup = tokens.some(token => 
    token.type === 'group' && 
    cursorPos >= token.start && cursorPos <= token.end
  );
  
  return {
    currentNode,
    parentNode,
    isInField,
    isInValue,
    isInRange,
    isInGroup
  };
}

// Simple tokenizer for context analysis
function tokenizeQuery(query: string): Array<{
  type: 'field' | 'operator' | 'value' | 'range' | 'group';
  value: string;
  start: number;
  end: number;
}> {
  const tokens: Array<{
    type: 'field' | 'operator' | 'value' | 'range' | 'group';
    value: string;
    start: number;
    end: number;
  }> = [];
  
  // Basic regex patterns for different token types
  const patterns = [
    { type: 'field' as const, regex: /[a-zA-Z_][a-zA-Z0-9_.-]*(?=[:><=])/, },
    { type: 'operator' as const, regex: /\b(AND|OR|NOT|TO)\b|[+\-!&|><=~^]/, },
    { type: 'range' as const, regex: /\[[^\]]*\]|\{[^}]*\}/, },
    { type: 'group' as const, regex: /\([^)]*\)/, },
    { type: 'value' as const, regex: /"[^"]*"|\S+/, }
  ];
  
  let pos = 0;
  while (pos < query.length) {
    let matched = false;
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex.source, 'g');
      regex.lastIndex = pos;
      const match = regex.exec(query);
      
      if (match && match.index === pos) {
        tokens.push({
          type: pattern.type,
          value: match[0],
          start: pos,
          end: pos + match[0].length
        });
        pos += match[0].length;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      pos++; // Skip unmatched characters
    }
  }
  
  return tokens;
}

export const luceneLanguageDefinition: languages.IMonarchLanguage = {
  defaultToken: '',
  ignoreCase: false,
  
  keywords: [
    'AND', 'OR', 'NOT', 'TO'
  ],

  operators: [
    '+', '-', '~', '^', '?', '*', '&&', '||', '!', '>', '>=', '<', '<=', '='
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
      
      // Field queries (field:value or field>value, etc.) - supports quoted field names
      [/"[^"]+"(?=[:><=])/, 'field.quoted'],
      [/[a-zA-Z_][a-zA-Z0-9_.-]*(?=[:><=])/, 'field'],
      [/:/, 'delimiter.colon'],
      
      // Comparison operators
      [/>=/, 'operator.comparison'],
      [/<=/, 'operator.comparison'],
      [/>/, 'operator.comparison'],
      [/</, 'operator.comparison'],
      [/=/, 'operator.comparison'],
      
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
      
      // Unbounded range wildcards
      [/\*(?=\s+(TO|\]|\}))/, 'operator.wildcard.range'],
      [/(?<=(\[|\{|TO)\s+)\*/, 'operator.wildcard.range'],
      
      // Fuzzy search with optional similarity
      [/~\d*\.?\d*/, 'operator.fuzzy'],
      
      // Boost operator with optional decimal
      [/\^\d*\.?\d*/, 'operator.boost'],
      
      // Wildcards
      [/[*?]/, 'operator.wildcard'],
      
      // Grouping parentheses
      [/[()]/, '@brackets'],
      
      // Numbers (including decimals, scientific notation, and negative numbers)
      [/-?\d+\.?\d*([eE][+-]?\d+)?/, 'number'],
      
      // Date formats (common in Lucene) - enhanced to support more formats
      [/\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?/, 'date'],
      [/\d{2}\/\d{2}\/\d{4}/, 'date'],
      [/\d{4}\/\d{2}\/\d{2}/, 'date'],
      
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
      [/\*/, 'operator.wildcard.range'],
      [/-?\d+\.?\d*([eE][+-]?\d+)?/, 'number'],
      [/\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?/, 'date'],
      [/[a-zA-Z_][a-zA-Z0-9_.-]*/, 'identifier'],
      [/\s+/, 'white'],
      [/./, 'text']
    ],
    
    rangeExclusive: [
      [/\}/, { token: 'delimiter.curly', next: '@pop' }],
      [/TO/, 'keyword.range'],
      [/\*/, 'operator.wildcard.range'],
      [/-?\d+\.?\d*([eE][+-]?\d+)?/, 'number'],
      [/\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?/, 'date'],
      [/[a-zA-Z_][a-zA-Z0-9_.-]*/, 'identifier'],
      [/\s+/, 'white'],
      [/./, 'text']
    ]
  }
};

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
  
  // Always re-define themes to allow switching
  monaco.editor.defineTheme('lucene-dark-theme', luceneDarkTheme);
  monaco.editor.defineTheme('lucene-light-theme', luceneLightTheme);
  
  // Dispose previous completion provider if it exists
  if (completionProviderDisposable) {
    completionProviderDisposable.dispose();
  }
  
  // Register new completion provider with current schema
  completionProviderDisposable = monaco.languages.registerCompletionItemProvider('lucene', {
    triggerCharacters: [':', ' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '_', '-', '.'],
    provideCompletionItems: (model, position) => {
      // Parse query context for better completions
      const fullQuery = model.getValue();
      const cursorOffset = model.getOffsetAt(position);
      const context = parseQueryContext(fullQuery, cursorOffset);
      const word = model.getWordUntilPosition(position);
      const lineText = model.getLineContent(position.lineNumber);
      const textBeforeCursor = lineText.substring(0, position.column - 1);
      
      // Check context for smart suggestions
      const isAfterColon = textBeforeCursor.match(/\w+:$/);
      const isAfterComparison = textBeforeCursor.match(/\w+(>=|<=|>|<|=)$/);
      const isInRange = textBeforeCursor.match(/[[{][^}\]]*$/);
      const isAfterOperator = textBeforeCursor.match(/\b(AND|OR|NOT|&&|\|\||!|\+|-)\s*$/);
      const isAtStart = textBeforeCursor.trim() === '' || isAfterOperator;
      const isTypingField = !isAfterColon && !isAfterComparison && !isInRange && word.word.length > 0;

      // Extract field name from "field:" or "field:value" or "field>value" pattern
      const fieldMatch = textBeforeCursor.match(/(\w+)[:>=<](\w*)$/);
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

      const suggestions: languages.CompletionItem[] = [];

      // Enhanced context-aware suggestions using syntax tree
      if (context.isInRange) {
        // In range context, prioritize range-specific completions
        suggestions.push({
          label: 'TO',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'TO ',
          documentation: 'Range query separator',
          range: range,
        });
        
        suggestions.push({
          label: '*',
          kind: monaco.languages.CompletionItemKind.Text,
          insertText: '*',
          documentation: 'Unbounded range wildcard',
          range: range,
        });
      }
      
      // Check if we're typing after a field colon or comparison operator for field-specific value suggestions
      if ((isTypingAfterColon || isAfterComparison) && fieldSchema) {
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
          // Return early to show only field-specific values if not in range
          if (!context.isInRange) {
            return { suggestions };
          }
        }
      }

      // Field name suggestions - enhanced with context awareness
      if ((isAtStart || isAfterOperator || isTypingField) && !context.isInRange) {
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

      // Operator suggestions - enhanced with context awareness
      if (!isInRange && !context.isInRange) {
        const operators = [
          { label: 'AND', doc: 'Boolean AND operator' },
          { label: 'OR', doc: 'Boolean OR operator' },
          { label: 'NOT', doc: 'Boolean NOT operator' },
          { label: '&&', doc: 'Boolean AND operator (alternative)' },
          { label: '||', doc: 'Boolean OR operator (alternative)' },
          { label: '!', doc: 'Boolean NOT operator (alternative)' },
          { label: '+', doc: 'Required term' },
          { label: '-', doc: 'Prohibited term' },
          { label: '>', doc: 'Greater than comparison' },
          { label: '>=', doc: 'Greater than or equal comparison' },
          { label: '<', doc: 'Less than comparison' },
          { label: '<=', doc: 'Less than or equal comparison' },
          { label: '=', doc: 'Exact equality comparison' }
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

      // Range query TO keyword (handled above in context-aware section)
      // This section is now integrated into the context-aware suggestions

      // Special search patterns - context-aware
      if ((isAfterColon || isAtStart) && !context.isInRange) {
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

        // Unbounded range queries
        suggestions.push({
          label: 'range from value',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '[${1:start} TO *]',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Range from value to infinity',
          range: range,
        });

        suggestions.push({
          label: 'range to value',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '[* TO ${1:end}]',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Range from negative infinity to value',
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