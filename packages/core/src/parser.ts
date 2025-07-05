import type { SyntaxNode, QueryContext } from './types.js';
import { tokenizeQuery } from './tokenizer.js';

/**
 * Parse query into basic syntax tree for context-aware completions
 */
export function parseQueryContext(query: string, cursorPos: number): QueryContext {
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

/**
 * Extract field information from query text at cursor position
 */
export function extractFieldContext(textBeforeCursor: string): {
  fieldName: string | null;
  currentValue: string;
  isAfterColon: boolean;
  isAfterComparison: boolean;
} {
  // Extract field name from "field:" or "field:value" or "field>value" pattern
  const fieldMatch = textBeforeCursor.match(/(\w+)([:>=<]+)(\w*)$/);
  const fieldName = fieldMatch ? fieldMatch[1] : null;
  const currentValue = fieldMatch ? fieldMatch[3] : '';
  
  const isAfterColon = /\w+:$/.test(textBeforeCursor);
  const isAfterComparison = /\w+(>=|<=|>|<|=)$/.test(textBeforeCursor);
  
  return {
    fieldName,
    currentValue,
    isAfterColon,
    isAfterComparison
  };
}