import type { languages } from 'monaco-editor';
import { LUCENE_CONSTANTS } from '@lucene-tools/core';

export const luceneLanguageDefinition: languages.IMonarchLanguage = {
  defaultToken: '',
  ignoreCase: false,
  
  keywords: LUCENE_CONSTANTS.keywords,
  operators: LUCENE_CONSTANTS.operators,
  brackets: [...LUCENE_CONSTANTS.brackets],

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