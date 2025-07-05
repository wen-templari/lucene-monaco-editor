import type { TokenInfo } from './types.js';

/**
 * Simple tokenizer for Lucene query context analysis
 */
export function tokenizeQuery(query: string): TokenInfo[] {
  const tokens: TokenInfo[] = [];
  
  // Basic regex patterns for different token types
  const patterns = [
    { type: 'field' as const, regex: /[a-zA-Z_][a-zA-Z0-9_.-]*(?=[:><=])/ },
    { type: 'operator' as const, regex: /\b(AND|OR|NOT|TO)\b|[+\-!&|><=~^]/ },
    { type: 'range' as const, regex: /\[[^\]]*\]|\{[^}]*\}/ },
    { type: 'group' as const, regex: /\([^)]*\)/ },
    { type: 'value' as const, regex: /"[^"]*"|\S+/ }
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

/**
 * Lucene syntax constants and patterns
 */
export const LUCENE_CONSTANTS = {
  keywords: ['AND', 'OR', 'NOT', 'TO'],
  operators: ['+', '-', '~', '^', '?', '*', '&&', '||', '!', '>', '>=', '<', '<=', '='],
  brackets: [
    { open: '(', close: ')', token: 'delimiter.parenthesis' },
    { open: '[', close: ']', token: 'delimiter.square' },
    { open: '{', close: '}', token: 'delimiter.curly' }
  ]
} as const;