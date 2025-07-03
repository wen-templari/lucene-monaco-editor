import { describe, it, expect, vi } from 'vitest'
import { luceneLanguageDefinition, luceneTheme, registerLuceneLanguage } from './lucene-monarch'

// Mock Monaco Editor
const mockMonaco = {
  languages: {
    register: vi.fn(),
    setMonarchTokensProvider: vi.fn(),
    setLanguageConfiguration: vi.fn(),
    registerCompletionItemProvider: vi.fn(),
    CompletionItemKind: {
      Field: 'Field',
      Operator: 'Operator',
      Keyword: 'Keyword',
      Text: 'Text',
      Snippet: 'Snippet',
    },
    CompletionItemInsertTextRule: {
      InsertAsSnippet: 'InsertAsSnippet',
    },
  },
  editor: {
    defineTheme: vi.fn(),
  },
}

describe('luceneLanguageDefinition', () => {
  it('should have correct structure', () => {
    expect(luceneLanguageDefinition).toHaveProperty('defaultToken')
    expect(luceneLanguageDefinition).toHaveProperty('ignoreCase')
    expect(luceneLanguageDefinition).toHaveProperty('keywords')
    expect(luceneLanguageDefinition).toHaveProperty('operators')
    expect(luceneLanguageDefinition).toHaveProperty('brackets')
    expect(luceneLanguageDefinition).toHaveProperty('tokenizer')
  })

  it('should include all expected keywords', () => {
    expect(luceneLanguageDefinition.keywords).toContain('AND')
    expect(luceneLanguageDefinition.keywords).toContain('OR')
    expect(luceneLanguageDefinition.keywords).toContain('NOT')
    expect(luceneLanguageDefinition.keywords).toContain('TO')
  })

  it('should include all expected operators', () => {
    expect(luceneLanguageDefinition.operators).toContain('+')
    expect(luceneLanguageDefinition.operators).toContain('-')
    expect(luceneLanguageDefinition.operators).toContain('~')
    expect(luceneLanguageDefinition.operators).toContain('^')
    expect(luceneLanguageDefinition.operators).toContain('*')
    expect(luceneLanguageDefinition.operators).toContain('?')
    expect(luceneLanguageDefinition.operators).toContain('&&')
    expect(luceneLanguageDefinition.operators).toContain('||')
    expect(luceneLanguageDefinition.operators).toContain('!')
  })

  it('should have proper tokenizer states', () => {
    expect(luceneLanguageDefinition.tokenizer).toHaveProperty('root')
    expect(luceneLanguageDefinition.tokenizer).toHaveProperty('rangeInclusive')
    expect(luceneLanguageDefinition.tokenizer).toHaveProperty('rangeExclusive')
    expect(Array.isArray(luceneLanguageDefinition.tokenizer.root)).toBe(true)
  })
})

describe('luceneTheme', () => {
  it('should have correct theme structure', () => {
    expect(luceneTheme).toHaveProperty('base', 'vs-dark')
    expect(luceneTheme).toHaveProperty('inherit', true)
    expect(luceneTheme).toHaveProperty('rules')
    expect(luceneTheme).toHaveProperty('colors')
    expect(Array.isArray(luceneTheme.rules)).toBe(true)
  })

  it('should include rules for all token types', () => {
    const tokenTypes = luceneTheme.rules.map(rule => rule.token)
    expect(tokenTypes).toContain('field')
    expect(tokenTypes).toContain('keyword')
    expect(tokenTypes).toContain('operator')
    expect(tokenTypes).toContain('string')
    expect(tokenTypes).toContain('number')
    expect(tokenTypes).toContain('regexp')
  })
})

describe('registerLuceneLanguage', () => {
  it('should register language with Monaco', () => {
    registerLuceneLanguage(mockMonaco as typeof import('monaco-editor'))
    
    expect(mockMonaco.languages.register).toHaveBeenCalledWith({ id: 'lucene' })
    expect(mockMonaco.languages.setMonarchTokensProvider).toHaveBeenCalledWith(
      'lucene',
      luceneLanguageDefinition
    )
    expect(mockMonaco.editor.defineTheme).toHaveBeenCalledWith('lucene-theme', luceneTheme)
    expect(mockMonaco.languages.setLanguageConfiguration).toHaveBeenCalled()
    expect(mockMonaco.languages.registerCompletionItemProvider).toHaveBeenCalled()
  })

  it('should register completion provider', () => {
    registerLuceneLanguage(mockMonaco as typeof import('monaco-editor'))
    
    const completionCall = mockMonaco.languages.registerCompletionItemProvider.mock.calls[0]
    expect(completionCall[0]).toBe('lucene')
    expect(completionCall[1]).toHaveProperty('provideCompletionItems')
    expect(typeof completionCall[1].provideCompletionItems).toBe('function')
  })
})

describe('Completion Provider', () => {
  let completionProvider: unknown

  beforeEach(() => {
    mockMonaco.languages.registerCompletionItemProvider.mockClear()
    registerLuceneLanguage(mockMonaco as typeof import('monaco-editor'))
    completionProvider = mockMonaco.languages.registerCompletionItemProvider.mock.calls[0][1]
  })

  const createMockModel = (lineContent: string) => ({
    getWordUntilPosition: vi.fn().mockReturnValue({
      startColumn: 1,
      endColumn: 1,
      word: '',
    }),
    getLineContent: vi.fn().mockReturnValue(lineContent),
  })

  const createMockPosition = (lineNumber: number, column: number) => ({
    lineNumber,
    column,
  })

  it('should provide field name completions at start of line', () => {
    const model = createMockModel('')
    const position = createMockPosition(1, 1)
    
    const result = completionProvider.provideCompletionItems(model, position)
    
    expect(result.suggestions).toBeDefined()
    const fieldSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.kind === 'Field'
    )
    expect(fieldSuggestions.length).toBeGreaterThan(0)
    expect(fieldSuggestions.some((s: { kind: string; label: string }) => s.label === 'title')).toBe(true)
    expect(fieldSuggestions.some((s: { kind: string; label: string }) => s.label === 'author')).toBe(true)
  })

  it('should provide operator completions', () => {
    const model = createMockModel('title:test ')
    const position = createMockPosition(1, 12)
    
    const result = completionProvider.provideCompletionItems(model, position)
    
    const operatorSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.kind === 'Operator'
    )
    expect(operatorSuggestions.length).toBeGreaterThan(0)
    expect(operatorSuggestions.some((s: { kind: string; label: string }) => s.label === 'AND')).toBe(true)
    expect(operatorSuggestions.some((s: { kind: string; label: string }) => s.label === 'OR')).toBe(true)
    expect(operatorSuggestions.some((s: { kind: string; label: string }) => s.label === 'NOT')).toBe(true)
  })

  it('should provide TO keyword in range queries', () => {
    const model = createMockModel('date:[2023 ')
    const position = createMockPosition(1, 12)
    
    const result = completionProvider.provideCompletionItems(model, position)
    
    const toSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.label === 'TO'
    )
    expect(toSuggestions.length).toBeGreaterThan(0)
    expect(toSuggestions[0].kind).toBe('Keyword')
  })

  it('should provide snippet completions', () => {
    const model = createMockModel('title:')
    const position = createMockPosition(1, 7)
    
    const result = completionProvider.provideCompletionItems(model, position)
    
    const snippetSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.kind === 'Snippet'
    )
    expect(snippetSuggestions.length).toBeGreaterThan(0)
    expect(snippetSuggestions.some((s: { kind: string; label: string }) => s.label === 'fuzzy search')).toBe(true)
    expect(snippetSuggestions.some((s: { kind: string; label: string }) => s.label === 'proximity search')).toBe(true)
    expect(snippetSuggestions.some((s: { kind: string; label: string }) => s.label === 'range inclusive')).toBe(true)
  })

  it('should provide escape character completions', () => {
    const model = createMockModel('title:')
    const position = createMockPosition(1, 7)
    
    const result = completionProvider.provideCompletionItems(model, position)
    
    const escapeSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.label.startsWith('\\')
    )
    expect(escapeSuggestions.length).toBeGreaterThan(0)
    expect(escapeSuggestions.some((s: { kind: string; label: string }) => s.label === '\\+')).toBe(true)
    expect(escapeSuggestions.some((s: { kind: string; label: string }) => s.label === '\\-')).toBe(true)
    expect(escapeSuggestions.some((s: { kind: string; label: string }) => s.label === '\\*')).toBe(true)
  })

  it('should provide wildcard completions', () => {
    const model = createMockModel('title:')
    const position = createMockPosition(1, 7)
    
    const result = completionProvider.provideCompletionItems(model, position)
    
    const wildcardSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.label === '*' || s.label === '?'
    )
    expect(wildcardSuggestions.length).toBe(2)
    expect(wildcardSuggestions.some((s: { kind: string; label: string }) => s.label === '*')).toBe(true)
    expect(wildcardSuggestions.some((s: { kind: string; label: string }) => s.label === '?')).toBe(true)
  })
})