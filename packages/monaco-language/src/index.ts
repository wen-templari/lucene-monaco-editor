/**
 * @lucene-tools/monaco-language
 * 
 * Monaco Editor language support for Lucene queries.
 * Provides syntax highlighting, themes, and intelligent completions.
 */

// Re-export core types for convenience
export type { FieldSchema } from '@lucene-tools/core';

// Language definition
export { luceneLanguageDefinition } from './monarch.js';

// Themes
export { luceneDarkTheme, luceneLightTheme } from './themes.js';

// Completion provider
export { createCompletionProvider } from './completion-provider.js';

// Main registration function
export { registerLuceneLanguage } from './register.js';