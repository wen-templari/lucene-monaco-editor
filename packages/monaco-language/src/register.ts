import type { IDisposable } from 'monaco-editor';
import type { FieldSchema } from '@lucene-tools/core';
import { luceneLanguageDefinition } from './monarch.js';
import { luceneDarkTheme, luceneLightTheme } from './themes.js';
import { createCompletionProvider } from './completion-provider.js';

// Track if language is already registered
let isLanguageRegistered = false;
let completionProviderDisposable: IDisposable | null = null;

export function registerLuceneLanguage(
  monaco: typeof import('monaco-editor'),
  fieldSchema?: FieldSchema[]
) {
  // Only register language features once
  if (!isLanguageRegistered) {
    // Register the language
    monaco.languages.register({ id: 'lucene' });
    
    // Set the tokenizer
    monaco.languages.setMonarchTokensProvider('lucene', luceneLanguageDefinition);
    
    // Configure language features
    monaco.languages.setLanguageConfiguration('lucene', {
      brackets: [
        ['(', ')'],
        ['[', ']'],
        ['{', '}']
      ],
      autoClosingPairs: [
        { open: '(', close: ')' },
        { open: '[', close: ']' },
        { open: '{', close: '}' },
        { open: '"', close: '"' }
      ],
      surroundingPairs: [
        { open: '(', close: ')' },
        { open: '[', close: ']' },
        { open: '{', close: '}' },
        { open: '"', close: '"' }
      ]
    });
    
    isLanguageRegistered = true;
  }
  
  // Always re-define themes to allow switching
  monaco.editor.defineTheme('lucene-dark-theme', luceneDarkTheme);
  monaco.editor.defineTheme('lucene-light-theme', luceneLightTheme);
  
  // Dispose previous completion provider if it exists
  if (completionProviderDisposable) {
    completionProviderDisposable.dispose();
  }
  
  // Register new completion provider with current schema
  completionProviderDisposable = monaco.languages.registerCompletionItemProvider(
    'lucene',
    createCompletionProvider(monaco, fieldSchema)
  );
}