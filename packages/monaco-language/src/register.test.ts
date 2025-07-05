import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerLuceneLanguage } from './register.js';
import type { FieldSchema } from '@lucene-tools/core';

// Mock Monaco Editor
const mockMonaco = {
  languages: {
    register: vi.fn(),
    setMonarchTokensProvider: vi.fn(),
    setLanguageConfiguration: vi.fn(),
    registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
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
  },
  editor: {
    defineTheme: vi.fn()
  }
} as any;

const mockFieldSchema: FieldSchema[] = [
  { key: 'status', values: ['active', 'inactive'] },
  { key: 'priority', values: ['high', 'low'] }
];

describe('registerLuceneLanguage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset the internal state by importing fresh module
    // Note: This is a limitation of testing modules with internal state
  });

  it('should register the language on first call', () => {
    registerLuceneLanguage(mockMonaco);
    
    expect(mockMonaco.languages.register).toHaveBeenCalledWith({ id: 'lucene' });
    expect(mockMonaco.languages.setMonarchTokensProvider).toHaveBeenCalledWith(
      'lucene', 
      expect.any(Object)
    );
    expect(mockMonaco.languages.setLanguageConfiguration).toHaveBeenCalledWith(
      'lucene',
      expect.any(Object)
    );
  });

  it('should define themes on every call', () => {
    registerLuceneLanguage(mockMonaco);
    
    expect(mockMonaco.editor.defineTheme).toHaveBeenCalledWith(
      'lucene-dark-theme',
      expect.any(Object)
    );
    expect(mockMonaco.editor.defineTheme).toHaveBeenCalledWith(
      'lucene-light-theme',
      expect.any(Object)
    );
  });

  it('should register completion provider', () => {
    registerLuceneLanguage(mockMonaco);
    
    expect(mockMonaco.languages.registerCompletionItemProvider).toHaveBeenCalledWith(
      'lucene',
      expect.any(Object)
    );
  });

  it('should register completion provider with field schema', () => {
    registerLuceneLanguage(mockMonaco, mockFieldSchema);
    
    expect(mockMonaco.languages.registerCompletionItemProvider).toHaveBeenCalledWith(
      'lucene',
      expect.any(Object)
    );
  });

  it('should be a function that accepts monaco and optional field schema', () => {
    expect(typeof registerLuceneLanguage).toBe('function');
    
    // Should not throw when called
    expect(() => registerLuceneLanguage(mockMonaco)).not.toThrow();
    expect(() => registerLuceneLanguage(mockMonaco, mockFieldSchema)).not.toThrow();
  });

  it('should define themes with correct structure', () => {
    registerLuceneLanguage(mockMonaco);
    
    const themesCalls = mockMonaco.editor.defineTheme.mock.calls;
    expect(themesCalls).toHaveLength(2);
    
    // Check dark theme
    const [darkThemeName, darkTheme] = themesCalls[0];
    expect(darkThemeName).toBe('lucene-dark-theme');
    expect(darkTheme.base).toBe('vs-dark');
    expect(darkTheme.rules).toBeDefined();
    expect(Array.isArray(darkTheme.rules)).toBe(true);
    
    // Check light theme
    const [lightThemeName, lightTheme] = themesCalls[1];
    expect(lightThemeName).toBe('lucene-light-theme');
    expect(lightTheme.base).toBe('vs');
    expect(lightTheme.rules).toBeDefined();
    expect(Array.isArray(lightTheme.rules)).toBe(true);
  });
});