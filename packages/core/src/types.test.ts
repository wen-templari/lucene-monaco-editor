import { describe, it, expect } from 'vitest';
import type { FieldSchema, SyntaxNode, TokenInfo, QueryContext, CompletionSuggestion } from './types.js';

describe('Type definitions', () => {
  it('should define FieldSchema interface correctly', () => {
    const fieldSchema: FieldSchema = {
      key: 'status',
      values: ['active', 'inactive']
    };
    
    expect(fieldSchema.key).toBe('status');
    expect(fieldSchema.values).toEqual(['active', 'inactive']);
  });

  it('should define SyntaxNode interface correctly', () => {
    const syntaxNode: SyntaxNode = {
      type: 'field',
      value: 'title',
      position: { start: 0, end: 5 }
    };
    
    expect(syntaxNode.type).toBe('field');
    expect(syntaxNode.value).toBe('title');
    expect(syntaxNode.position).toEqual({ start: 0, end: 5 });
  });

  it('should define SyntaxNode with children', () => {
    const childNode: SyntaxNode = {
      type: 'value',
      value: 'test',
      position: { start: 6, end: 10 }
    };
    
    const parentNode: SyntaxNode = {
      type: 'group',
      value: '(title:test)',
      position: { start: 0, end: 12 },
      children: [childNode]
    };
    
    expect(parentNode.children).toHaveLength(1);
    expect(parentNode.children![0]).toBe(childNode);
  });

  it('should define TokenInfo interface correctly', () => {
    const tokenInfo: TokenInfo = {
      type: 'field',
      value: 'title',
      start: 0,
      end: 5
    };
    
    expect(tokenInfo.type).toBe('field');
    expect(tokenInfo.value).toBe('title');
    expect(tokenInfo.start).toBe(0);
    expect(tokenInfo.end).toBe(5);
  });

  it('should define QueryContext interface correctly', () => {
    const queryContext: QueryContext = {
      currentNode: null,
      parentNode: null,
      isInField: true,
      isInValue: false,
      isInRange: false,
      isInGroup: false
    };
    
    expect(queryContext.isInField).toBe(true);
    expect(queryContext.isInValue).toBe(false);
    expect(queryContext.currentNode).toBe(null);
  });

  it('should define CompletionSuggestion interface correctly', () => {
    const suggestion: CompletionSuggestion = {
      label: 'title',
      insertText: 'title:',
      documentation: 'Search in title field',
      kind: 'field',
      sortText: '0title'
    };
    
    expect(suggestion.label).toBe('title');
    expect(suggestion.insertText).toBe('title:');
    expect(suggestion.kind).toBe('field');
    expect(suggestion.sortText).toBe('0title');
  });

  it('should define CompletionSuggestion with minimal properties', () => {
    const suggestion: CompletionSuggestion = {
      label: 'AND',
      insertText: 'AND ',
      kind: 'operator'
    };
    
    expect(suggestion.label).toBe('AND');
    expect(suggestion.insertText).toBe('AND ');
    expect(suggestion.kind).toBe('operator');
    expect(suggestion.documentation).toBeUndefined();
    expect(suggestion.sortText).toBeUndefined();
  });

  it('should support all SyntaxNode types', () => {
    const types: SyntaxNode['type'][] = ['field', 'operator', 'value', 'group', 'range'];
    
    types.forEach(type => {
      const node: SyntaxNode = {
        type,
        value: 'test',
        position: { start: 0, end: 4 }
      };
      expect(node.type).toBe(type);
    });
  });

  it('should support all TokenInfo types', () => {
    const types: TokenInfo['type'][] = ['field', 'operator', 'value', 'range', 'group'];
    
    types.forEach(type => {
      const token: TokenInfo = {
        type,
        value: 'test',
        start: 0,
        end: 4
      };
      expect(token.type).toBe(type);
    });
  });

  it('should support all CompletionSuggestion kinds', () => {
    const kinds: CompletionSuggestion['kind'][] = ['field', 'operator', 'value', 'keyword', 'snippet'];
    
    kinds.forEach(kind => {
      const suggestion: CompletionSuggestion = {
        label: 'test',
        insertText: 'test',
        kind
      };
      expect(suggestion.kind).toBe(kind);
    });
  });
});