import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import App from './App'
import { ThemeProvider } from './ThemeContext'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

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

// Helper function to render components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  )
}

describe('App', () => {
  it('renders title', () => {
    renderWithTheme(<App />)
    expect(screen.getByText('Lucene Monaco Editor')).toBeInTheDocument()
  })

  it('renders Monaco editor', () => {
    renderWithTheme(<App />)
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('passes correct props to Monaco editor', () => {
    renderWithTheme(<App />)
    const editor = screen.getByTestId('monaco-editor')
    
    expect(editor).toHaveAttribute('height', '100%')
    expect(editor).toHaveAttribute('defaultLanguage', 'lucene')
    expect(editor).toHaveAttribute('theme', 'lucene-light-theme')
  })

  it('has default Lucene query examples', () => {
    renderWithTheme(<App />)
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
    renderWithTheme(<App />)
    const editor = screen.getByTestId('monaco-editor')
    
    // Monaco editor should receive options
    expect(editor).toHaveAttribute('options')
  })
})