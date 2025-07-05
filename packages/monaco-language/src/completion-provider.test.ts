import { describe, it, expect, vi } from 'vitest';
import { createCompletionProvider } from './completion-provider.js';
import type { FieldSchema } from '@lucene-tools/core';

// Mock Monaco Editor types and objects
const mockMonaco = {
  languages: {
    CompletionItemKind: {
      Field: 'Field',
      Operator: 'Operator',
      Value: 'Value',
      Keyword: 'Keyword',
      Snippet: 'Snippet',
      Text: 'Text'
    },
    CompletionItemInsertTextRule: {
      InsertAsSnippet: 4
    }
  }
} as any;

const mockModel = {
  getValue: vi.fn(),
  getOffsetAt: vi.fn(),
  getWordUntilPosition: vi.fn(),
  getLineContent: vi.fn()
};

const mockPosition = {
  lineNumber: 1,
  column: 10
};

const mockFieldSchema: FieldSchema[] = [
  { key: 'status', values: ['active', 'inactive', 'pending'] },
  { key: 'priority', values: ['high', 'medium', 'low'] }
];

describe('createCompletionProvider', () => {
  it('should create a completion provider with correct structure', () => {
    const provider = createCompletionProvider(mockMonaco);
    
    expect(provider).toBeDefined();
    expect(provider.triggerCharacters).toBeDefined();
    expect(provider.provideCompletionItems).toBeDefined();
    expect(typeof provider.provideCompletionItems).toBe('function');
  });

  it('should include appropriate trigger characters', () => {
    const provider = createCompletionProvider(mockMonaco);
    
    expect(provider.triggerCharacters).toContain(':');
    expect(provider.triggerCharacters).toContain(' ');
    expect(provider.triggerCharacters).toContain('a');
    expect(provider.triggerCharacters).toContain('A');
    expect(provider.triggerCharacters).toContain('0');
    expect(provider.triggerCharacters).toContain('_');
  });

  it('should handle completion requests with field schema', () => {
    const provider = createCompletionProvider(mockMonaco, mockFieldSchema);
    
    // Mock the model methods
    mockModel.getValue.mockReturnValue('status:');
    mockModel.getOffsetAt.mockReturnValue(7);
    mockModel.getWordUntilPosition.mockReturnValue({
      word: '',
      startColumn: 8,
      endColumn: 8
    });
    mockModel.getLineContent.mockReturnValue('status:');
    
    const result = provider.provideCompletionItems(mockModel as any, mockPosition);
    
    expect(result).toBeDefined();
    expect(result.suggestions).toBeDefined();
    expect(Array.isArray(result.suggestions)).toBe(true);
  });

  it('should handle completion requests without field schema', () => {
    const provider = createCompletionProvider(mockMonaco);
    
    // Mock the model methods
    mockModel.getValue.mockReturnValue('title:test');
    mockModel.getOffsetAt.mockReturnValue(10);
    mockModel.getWordUntilPosition.mockReturnValue({
      word: 'test',
      startColumn: 7,
      endColumn: 11
    });
    mockModel.getLineContent.mockReturnValue('title:test');
    
    const result = provider.provideCompletionItems(mockModel as any, mockPosition);
    
    expect(result).toBeDefined();
    expect(result.suggestions).toBeDefined();
    expect(Array.isArray(result.suggestions)).toBe(true);
  });

  it('should include Monaco-specific snippets', () => {
    const provider = createCompletionProvider(mockMonaco);
    
    // Mock for a context that should include snippets
    mockModel.getValue.mockReturnValue('');
    mockModel.getOffsetAt.mockReturnValue(0);
    mockModel.getWordUntilPosition.mockReturnValue({
      word: '',
      startColumn: 1,
      endColumn: 1
    });
    mockModel.getLineContent.mockReturnValue('');
    
    const result = provider.provideCompletionItems(mockModel as any, mockPosition);
    
    expect(result.suggestions).toBeDefined();
    
    // Look for snippet suggestions
    const snippets = result.suggestions.filter(s => s.kind === mockMonaco.languages.CompletionItemKind.Snippet);
    expect(snippets.length).toBeGreaterThan(0);
    
    // Check for specific snippets
    const snippetLabels = snippets.map(s => s.label);
    expect(snippetLabels).toContain('fuzzy search');
    expect(snippetLabels).toContain('proximity search');
    expect(snippetLabels).toContain('boost query');
    expect(snippetLabels).toContain('range inclusive');
    expect(snippetLabels).toContain('range exclusive');
  });

  it('should set proper range for completions', () => {
    const provider = createCompletionProvider(mockMonaco);
    
    mockModel.getValue.mockReturnValue('test');
    mockModel.getOffsetAt.mockReturnValue(4);
    mockModel.getWordUntilPosition.mockReturnValue({
      word: 'test',
      startColumn: 1,
      endColumn: 5
    });
    mockModel.getLineContent.mockReturnValue('test');
    
    const result = provider.provideCompletionItems(mockModel as any, mockPosition);
    
    expect(result.suggestions.length).toBeGreaterThan(0);
    
    const firstSuggestion = result.suggestions[0];
    expect(firstSuggestion.range).toBeDefined();
    expect(firstSuggestion.range.startLineNumber).toBe(mockPosition.lineNumber);
    expect(firstSuggestion.range.endLineNumber).toBe(mockPosition.lineNumber);
    expect(firstSuggestion.range.startColumn).toBe(1);
    expect(firstSuggestion.range.endColumn).toBe(5);
  });

  it('should handle snippet insert text rules', () => {
    const provider = createCompletionProvider(mockMonaco);
    
    mockModel.getValue.mockReturnValue('');
    mockModel.getOffsetAt.mockReturnValue(0);
    mockModel.getWordUntilPosition.mockReturnValue({
      word: '',
      startColumn: 1,
      endColumn: 1
    });
    mockModel.getLineContent.mockReturnValue('');
    
    const result = provider.provideCompletionItems(mockModel as any, mockPosition);
    
    const snippets = result.suggestions.filter(s => s.kind === mockMonaco.languages.CompletionItemKind.Snippet);
    expect(snippets.length).toBeGreaterThan(0);
    
    // Check that snippets have proper insert text rules
    snippets.forEach(snippet => {
      expect(snippet.insertTextRules).toBe(mockMonaco.languages.CompletionItemInsertTextRule.InsertAsSnippet);
    });
  });
});

describe('getMonacoCompletionKind', () => {
  // Since getMonacoCompletionKind is not exported, we test it indirectly through the completion provider
  it('should map completion kinds correctly', () => {
    const provider = createCompletionProvider(mockMonaco, mockFieldSchema);
    
    // Mock for field completion
    mockModel.getValue.mockReturnValue('');
    mockModel.getOffsetAt.mockReturnValue(0);
    mockModel.getWordUntilPosition.mockReturnValue({
      word: '',
      startColumn: 1,
      endColumn: 1
    });
    mockModel.getLineContent.mockReturnValue('');
    
    const result = provider.provideCompletionItems(mockModel as any, mockPosition);
    
    // Check that different kinds are mapped properly
    const suggestions = result.suggestions;
    const fieldSuggestions = suggestions.filter(s => s.kind === mockMonaco.languages.CompletionItemKind.Field);
    const operatorSuggestions = suggestions.filter(s => s.kind === mockMonaco.languages.CompletionItemKind.Operator);
    
    expect(fieldSuggestions.length).toBeGreaterThan(0);
    expect(operatorSuggestions.length).toBeGreaterThan(0);
  });
});