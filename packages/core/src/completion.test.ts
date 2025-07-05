import { describe, it, expect } from 'vitest';
import { generateCompletions } from './completion.js';
import type { QueryContext, FieldSchema } from './types.js';

describe('generateCompletions', () => {
  const mockFieldSchema: FieldSchema[] = [
    { key: 'status', values: ['active', 'inactive', 'pending'] },
    { key: 'priority', values: ['high', 'medium', 'low'] },
    { key: 'category', values: ['bug', 'feature', 'improvement'] }
  ];

  const mockContext = (overrides: Partial<QueryContext> = {}): QueryContext => ({
    currentNode: null,
    parentNode: null,
    isInField: false,
    isInValue: false,
    isInRange: false,
    isInGroup: false,
    ...overrides
  });

  it('should suggest field names at start of query', () => {
    const suggestions = generateCompletions('', '', mockContext(), mockFieldSchema);
    
    const fieldSuggestions = suggestions.filter(s => s.kind === 'field');
    expect(fieldSuggestions.length).toBeGreaterThan(0);
    
    const statusField = fieldSuggestions.find(s => s.label === 'status');
    expect(statusField).toBeDefined();
    expect(statusField?.insertText).toBe('status:');
    expect(statusField?.documentation).toContain('active, inactive, pending');
  });

  it('should suggest field values after colon', () => {
    const suggestions = generateCompletions('status:', '', mockContext(), mockFieldSchema);
    
    const valueSuggestions = suggestions.filter(s => s.kind === 'value');
    expect(valueSuggestions).toHaveLength(3);
    
    const activeValue = valueSuggestions.find(s => s.label === 'active');
    expect(activeValue).toBeDefined();
    expect(activeValue?.insertText).toBe('active');
  });

  it('should filter field values based on partial input', () => {
    const suggestions = generateCompletions('status:a', 'a', mockContext(), mockFieldSchema);
    
    const valueSuggestions = suggestions.filter(s => s.kind === 'value');
    expect(valueSuggestions.length).toBeGreaterThan(0);
    const activeValue = valueSuggestions.find(s => s.label === 'active');
    expect(activeValue).toBeDefined();
  });

  it('should suggest operators when appropriate', () => {
    const suggestions = generateCompletions('title:test ', '', mockContext());
    
    const operatorSuggestions = suggestions.filter(s => s.kind === 'operator');
    expect(operatorSuggestions.length).toBeGreaterThan(0);
    
    const andOperator = operatorSuggestions.find(s => s.label === 'AND');
    expect(andOperator).toBeDefined();
    expect(andOperator?.insertText).toBe('AND ');
  });

  it('should suggest range keywords in range context', () => {
    const rangeContext = mockContext({ isInRange: true });
    const suggestions = generateCompletions('[2023-01-01 ', '', rangeContext);
    
    const toKeyword = suggestions.find(s => s.label === 'TO');
    expect(toKeyword).toBeDefined();
    expect(toKeyword?.kind).toBe('keyword');
    
    const wildcard = suggestions.find(s => s.label === '*');
    expect(wildcard).toBeDefined();
    expect(wildcard?.kind).toBe('operator');
  });

  it('should suggest field names after operators', () => {
    const suggestions = generateCompletions('title:test AND ', '', mockContext(), mockFieldSchema);
    
    const fieldSuggestions = suggestions.filter(s => s.kind === 'field');
    expect(fieldSuggestions.length).toBeGreaterThan(0);
  });

  it('should handle comparison operators', () => {
    const suggestions = generateCompletions('score>', '', mockContext(), mockFieldSchema);
    
    const operatorSuggestions = suggestions.filter(s => s.kind === 'operator');
    expect(operatorSuggestions.length).toBeGreaterThan(0);
  });

  it('should prioritize custom fields', () => {
    const suggestions = generateCompletions('', 'st', mockContext(), mockFieldSchema);
    
    const statusField = suggestions.find(s => s.label === 'status');
    expect(statusField?.sortText).toBe('0status');
    
    const defaultField = suggestions.find(s => s.label.startsWith('st'));
    expect(defaultField).toBeDefined();
  });

  it('should not suggest operators in range context', () => {
    const rangeContext = mockContext({ isInRange: true });
    const suggestions = generateCompletions('[2023-01-01 ', '', rangeContext);
    
    const andOperator = suggestions.find(s => s.label === 'AND');
    expect(andOperator).toBeUndefined();
  });

  it('should handle empty field schema', () => {
    const suggestions = generateCompletions('', '', mockContext(), []);
    
    const fieldSuggestions = suggestions.filter(s => s.kind === 'field');
    expect(fieldSuggestions.length).toBeGreaterThan(0);
    
    // Should still suggest default fields
    const titleField = fieldSuggestions.find(s => s.label === 'title');
    expect(titleField).toBeDefined();
  });

  it('should handle no field schema', () => {
    const suggestions = generateCompletions('', '', mockContext());
    
    const fieldSuggestions = suggestions.filter(s => s.kind === 'field');
    expect(fieldSuggestions.length).toBeGreaterThan(0);
    
    // Should suggest default fields
    const titleField = fieldSuggestions.find(s => s.label === 'title');
    expect(titleField).toBeDefined();
  });
});