import { describe, it, expect, vi, beforeEach } from 'vitest'
import { luceneLanguageDefinition, luceneDarkTheme, registerLuceneLanguage, type FieldSchema } from './lucene-monarch'

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
      Value: 'Value',
    },
    CompletionItemInsertTextRule: {
      InsertAsSnippet: 'InsertAsSnippet',
    },
  },
  editor: {
    defineTheme: vi.fn(),
  },
  // Add missing properties to satisfy type checking
  Emitter: vi.fn(),
  MarkerTag: {},
  MarkerSeverity: {},
  CancellationTokenSource: vi.fn(),
  CancellationToken: {},
  Position: vi.fn(),
  Range: vi.fn(),
  Selection: vi.fn(),
  SelectionDirection: {},
  KeyCode: {},
  KeyMod: {},
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
    expect(luceneDarkTheme).toHaveProperty('base', 'vs-dark')
    expect(luceneDarkTheme).toHaveProperty('inherit', true)
    expect(luceneDarkTheme).toHaveProperty('rules')
    expect(luceneDarkTheme).toHaveProperty('colors')
    expect(Array.isArray(luceneDarkTheme.rules)).toBe(true)
  })

  it('should include rules for all token types', () => {
    const tokenTypes = luceneDarkTheme.rules.map((rule: any) => rule.token)
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
    registerLuceneLanguage(mockMonaco as any)
    
    expect(mockMonaco.languages.register).toHaveBeenCalledWith({ id: 'lucene' })
    expect(mockMonaco.languages.setMonarchTokensProvider).toHaveBeenCalledWith(
      'lucene',
      luceneLanguageDefinition
    )
    expect(mockMonaco.editor.defineTheme).toHaveBeenCalledWith('lucene-dark-theme', luceneDarkTheme)
    expect(mockMonaco.languages.setLanguageConfiguration).toHaveBeenCalled()
    expect(mockMonaco.languages.registerCompletionItemProvider).toHaveBeenCalled()
  })

  it('should register completion provider', () => {
    registerLuceneLanguage(mockMonaco as any)
    
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
    registerLuceneLanguage(mockMonaco as any)
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
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
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
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
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
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    const toSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.label === 'TO'
    )
    expect(toSuggestions.length).toBeGreaterThan(0)
    expect(toSuggestions[0].kind).toBe('Keyword')
  })

  it('should provide snippet completions', () => {
    const model = createMockModel('title:')
    const position = createMockPosition(1, 7)
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
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
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
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
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    const wildcardSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.label === '*' || s.label === '?'
    )
    expect(wildcardSuggestions.length).toBe(2)
    expect(wildcardSuggestions.some((s: { kind: string; label: string }) => s.label === '*')).toBe(true)
    expect(wildcardSuggestions.some((s: { kind: string; label: string }) => s.label === '?')).toBe(true)
  })
})

describe('Custom Field Schema Completion', () => {
  let completionProvider: unknown

  const testFieldSchema: FieldSchema[] = [
    { key: 'level', values: ['warning', 'info', 'error'] },
    { key: 'location', values: ['123.123.123', '3333.444'] }
  ]

  beforeEach(() => {
    mockMonaco.languages.registerCompletionItemProvider.mockClear()
    registerLuceneLanguage(mockMonaco as any, testFieldSchema)
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

  it('should include custom fields in field name suggestions', () => {
    const model = createMockModel('')
    const position = createMockPosition(1, 1)
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    const fieldSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.kind === 'Field'
    )
    expect(fieldSuggestions.some((s: { kind: string; label: string }) => s.label === 'level')).toBe(true)
    expect(fieldSuggestions.some((s: { kind: string; label: string }) => s.label === 'location')).toBe(true)
  })

  it('should provide field-specific value suggestions after field colon', () => {
    const model = createMockModel('level:')
    const position = createMockPosition(1, 7)
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    const valueSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.kind === 'Value'
    )
    expect(valueSuggestions.length).toBe(3)
    expect(valueSuggestions.some((s: { kind: string; label: string }) => s.label === 'warning')).toBe(true)
    expect(valueSuggestions.some((s: { kind: string; label: string }) => s.label === 'info')).toBe(true)
    expect(valueSuggestions.some((s: { kind: string; label: string }) => s.label === 'error')).toBe(true)
  })

  it('should provide location-specific value suggestions', () => {
    const model = createMockModel('location:')
    const position = createMockPosition(1, 10)
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    const valueSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.kind === 'Value'
    )
    expect(valueSuggestions.length).toBe(2)
    expect(valueSuggestions.some((s: { kind: string; label: string }) => s.label === '123.123.123')).toBe(true)
    expect(valueSuggestions.some((s: { kind: string; label: string }) => s.label === '3333.444')).toBe(true)
  })

  it('should only show field-specific values when typing after custom field colon', () => {
    const model = createMockModel('level:')
    const position = createMockPosition(1, 7)
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    // Should only show field values, not operators or other completions
    expect(result.suggestions.every((s: { kind: string; label: string }) => s.kind === 'Value')).toBe(true)
    expect(result.suggestions.length).toBe(3)
  })

  it('should fall back to general completions for unknown fields', () => {
    const model = createMockModel('unknown:')
    const position = createMockPosition(1, 9)
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    // Should provide general completions since 'unknown' is not in schema
    expect(result.suggestions.length).toBeGreaterThan(3)
    expect(result.suggestions.some((s: { kind: string; label: string }) => s.kind === 'Operator')).toBe(true)
  })

  it('should provide field completions when typing field names', () => {
    const model = createMockModel('lev')
    model.getWordUntilPosition = vi.fn().mockReturnValue({
      startColumn: 1,
      endColumn: 4,
      word: 'lev',
    })
    const position = createMockPosition(1, 4)
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    const fieldSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.kind === 'Field'
    )
    expect(fieldSuggestions.some((s: { kind: string; label: string }) => s.label === 'level')).toBe(true)
  })

  it('should prioritize custom fields in completion', () => {
    const model = createMockModel('l')
    model.getWordUntilPosition = vi.fn().mockReturnValue({
      startColumn: 1,
      endColumn: 2,
      word: 'l',
    })
    const position = createMockPosition(1, 2)
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    const fieldSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.kind === 'Field'
    )
    const levelSuggestion = fieldSuggestions.find((s: { kind: string; label: string; sortText?: string }) => s.label === 'level')
    const locationSuggestion = fieldSuggestions.find((s: { kind: string; label: string; sortText?: string }) => s.label === 'location')
    
    expect(levelSuggestion?.sortText).toBe('0level')
    expect(locationSuggestion?.sortText).toBe('0location')
  })

  it('should show field values in documentation for custom fields', () => {
    const model = createMockModel('lev')
    model.getWordUntilPosition = vi.fn().mockReturnValue({
      startColumn: 1,
      endColumn: 4,
      word: 'lev',
    })
    const position = createMockPosition(1, 4)
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    const levelSuggestion = result.suggestions.find(
      (s: { kind: string; label: string }) => s.kind === 'Field' && s.label === 'level'
    )
    expect(levelSuggestion?.documentation).toContain('Custom field: level')
    expect(levelSuggestion?.documentation).toContain('warning, info, error')
  })

  it('should provide filtered value completions when typing after colon', () => {
    const model = createMockModel('level:w')
    model.getWordUntilPosition = vi.fn().mockReturnValue({
      startColumn: 7,
      endColumn: 8,
      word: 'w',
    })
    const position = createMockPosition(1, 8)
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    const valueSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.kind === 'Value'
    )
    expect(valueSuggestions.length).toBe(1)
    expect(valueSuggestions.some((s: { kind: string; label: string }) => s.label === 'warning')).toBe(true)
    expect(valueSuggestions.some((s: { kind: string; label: string }) => s.label === 'info')).toBe(false)
  })

  it('should provide all value completions when just after colon', () => {
    const model = createMockModel('level:')
    model.getWordUntilPosition = vi.fn().mockReturnValue({
      startColumn: 7,
      endColumn: 7,
      word: '',
    })
    const position = createMockPosition(1, 7)
    
    const result = (completionProvider as any).provideCompletionItems(model, position)
    
    const valueSuggestions = result.suggestions.filter(
      (s: { kind: string; label: string }) => s.kind === 'Value'
    )
    expect(valueSuggestions.length).toBe(3)
    expect(valueSuggestions.some((s: { kind: string; label: string }) => s.label === 'warning')).toBe(true)
    expect(valueSuggestions.some((s: { kind: string; label: string }) => s.label === 'info')).toBe(true)
    expect(valueSuggestions.some((s: { kind: string; label: string }) => s.label === 'error')).toBe(true)
  })
})