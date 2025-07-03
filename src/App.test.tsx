import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ onMount, ...props }: { onMount?: (editor: unknown, monaco: unknown) => void; [key: string]: unknown }) => {
    // Simulate Monaco editor mount
    if (onMount) {
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
      onMount(null, mockMonaco)
    }
    return <div data-testid="monaco-editor" {...props} />
  },
}))

describe('App', () => {
  it('renders title', () => {
    render(<App />)
    expect(screen.getByText('Lucene Monaco Editor')).toBeInTheDocument()
  })

  it('renders Monaco editor', () => {
    render(<App />)
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('passes correct props to Monaco editor', () => {
    render(<App />)
    const editor = screen.getByTestId('monaco-editor')
    
    expect(editor).toHaveAttribute('height', '100%')
    expect(editor).toHaveAttribute('defaultLanguage', 'lucene')
    expect(editor).toHaveAttribute('theme', 'lucene-theme')
  })

  it('has default Lucene query examples', () => {
    render(<App />)
    const editor = screen.getByTestId('monaco-editor')
    
    // Check that the editor has some default value with Lucene examples
    expect(editor).toHaveAttribute('value')
    const value = editor.getAttribute('value')
    expect(value).toBeTruthy()
    expect(value).toContain('title:')
    expect(value).toContain('AND')
    expect(value).toContain('OR')
  })

  it('provides editor configuration options', () => {
    render(<App />)
    const editor = screen.getByTestId('monaco-editor')
    
    // Monaco editor should receive options
    expect(editor).toHaveAttribute('options')
  })
})