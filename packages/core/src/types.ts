/**
 * Core types and interfaces for Lucene language support
 */

export interface FieldSchema {
  key: string;
  values: string[];
}

export interface SyntaxNode {
  type: 'field' | 'operator' | 'value' | 'group' | 'range';
  value: string;
  position: { start: number; end: number };
  children?: SyntaxNode[];
}

export interface TokenInfo {
  type: 'field' | 'operator' | 'value' | 'range' | 'group';
  value: string;
  start: number;
  end: number;
}

export interface QueryContext {
  currentNode: SyntaxNode | null;
  parentNode: SyntaxNode | null;
  isInField: boolean;
  isInValue: boolean;
  isInRange: boolean;
  isInGroup: boolean;
}

export interface CompletionSuggestion {
  label: string;
  insertText: string;
  documentation?: string;
  kind: 'field' | 'operator' | 'value' | 'keyword' | 'snippet';
  sortText?: string;
}