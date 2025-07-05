/**
 * @lucene-tools/core
 * 
 * Core Lucene language parsing and validation logic.
 * Platform-agnostic components for building Lucene language support.
 */

// Type definitions
export type {
  FieldSchema,
  SyntaxNode,
  TokenInfo,
  QueryContext,
  CompletionSuggestion
} from './types.js';

// Tokenization
export {
  tokenizeQuery,
  LUCENE_CONSTANTS
} from './tokenizer.js';

// Parsing
export {
  parseQueryContext,
  extractFieldContext
} from './parser.js';

// Completion
export {
  generateCompletions
} from './completion.js';