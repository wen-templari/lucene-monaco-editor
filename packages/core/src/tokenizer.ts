import type { TokenInfo } from './types.js';

/**
 * Simple tokenizer for Lucene query context analysis
 */
export function tokenizeQuery(query: string): TokenInfo[] {
  const tokens: TokenInfo[] = [];
  
  let pos = 0;
  while (pos < query.length) {
    const char = query[pos];
    
    // Skip whitespace
    if (/\s/.test(char)) {
      pos++;
      continue;
    }
    
    let matched = false;
    
    // Try to match range queries first (highest priority)
    if (char === '[' || char === '{') {
      const closeChar = char === '[' ? ']' : '}';
      const endPos = query.indexOf(closeChar, pos);
      if (endPos !== -1) {
        tokens.push({
          type: 'range',
          value: query.substring(pos, endPos + 1),
          start: pos,
          end: endPos + 1
        });
        pos = endPos + 1;
        matched = true;
      }
    }
    
    // Try to match group queries
    if (!matched && char === '(') {
      const endPos = query.indexOf(')', pos);
      if (endPos !== -1) {
        tokens.push({
          type: 'group',
          value: query.substring(pos, endPos + 1),
          start: pos,
          end: endPos + 1
        });
        pos = endPos + 1;
        matched = true;
      }
    }
    
    // Try to match quoted strings
    if (!matched && char === '"') {
      const endPos = query.indexOf('"', pos + 1);
      if (endPos !== -1) {
        tokens.push({
          type: 'value',
          value: query.substring(pos, endPos + 1),
          start: pos,
          end: endPos + 1
        });
        pos = endPos + 1;
        matched = true;
      }
    }
    
    // Try to match field names (word followed by :, >, <, =, >=, <=)
    if (!matched && /[a-zA-Z_]/.test(char)) {
      const wordMatch = query.substring(pos).match(/^[a-zA-Z_][a-zA-Z0-9_.-]*/);
      if (wordMatch) {
        const nextPos = pos + wordMatch[0].length;
        const nextChar = query[nextPos];
        
        // Check if it's followed by a field separator
        if (nextChar === ':' || nextChar === '>' || nextChar === '<' || nextChar === '=') {
          tokens.push({
            type: 'field',
            value: wordMatch[0],
            start: pos,
            end: nextPos
          });
          pos = nextPos;
          matched = true;
        }
      }
    }
    
    // Try to match operators and keywords
    if (!matched) {
      // Multi-character operators
      if (pos + 1 < query.length) {
        const twoChar = query.substring(pos, pos + 2);
        if (['&&', '||', '>=', '<='].includes(twoChar)) {
          tokens.push({
            type: 'operator',
            value: twoChar,
            start: pos,
            end: pos + 2
          });
          pos += 2;
          matched = true;
        }
      }
      
      // Single character operators
      if (!matched && /[+\-!&|><=~^:]/.test(char)) {
        tokens.push({
          type: 'operator',
          value: char,
          start: pos,
          end: pos + 1
        });
        pos++;
        matched = true;
      }
    }
    
    // Try to match keywords or regular values
    if (!matched && /[a-zA-Z0-9]/.test(char)) {
      const wordMatch = query.substring(pos).match(/^[a-zA-Z0-9_.-]+/);
      if (wordMatch) {
        const word = wordMatch[0];
        const type = ['AND', 'OR', 'NOT', 'TO'].includes(word.toUpperCase()) ? 'operator' : 'value';
        tokens.push({
          type,
          value: word,
          start: pos,
          end: pos + word.length
        });
        pos += word.length;
        matched = true;
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