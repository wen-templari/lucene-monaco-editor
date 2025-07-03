# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based Monaco Editor implementation with custom Lucene query syntax highlighting. The project provides a web-based editor specifically designed for writing and editing Apache Lucene search queries with comprehensive syntax highlighting support.

## Key Architecture

### Core Components

- **`src/lucene-monarch.ts`**: The heart of the syntax highlighting system. Contains the Monaco Monarch language definition for Lucene queries, including:
  - `luceneLanguageDefinition`: Complete tokenizer rules for all Lucene syntax elements
  - `luceneTheme`: Dark theme with distinct colors for different token types
  - `registerLuceneLanguage()`: Function to register the language with Monaco
  - Stateful parsing for range queries with separate `rangeInclusive` and `rangeExclusive` states

- **`src/App.tsx`**: Main React component that integrates the Monaco editor with the Lucene language definition. The language registration happens in the `onMount` callback to ensure Monaco is fully loaded.

### Lucene Syntax Support

The implementation supports comprehensive Lucene query syntax including:
- Field queries (`field:value`)
- Boolean operators (AND, OR, NOT, &&, ||, !)
- Range queries with inclusive `[a TO b]` and exclusive `{a TO b}` brackets
- Wildcard searches (`*`, `?`)
- Fuzzy search with similarity (`term~0.8`)
- Proximity search (`"phrase"~10`)
- Boost queries (`term^2.5`)
- Regular expressions (`/pattern/`)
- Date format recognition (ISO 8601)
- Escaped characters

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Technical Notes

### Monaco Editor Integration

The project uses `@monaco-editor/react` wrapper. The custom Lucene language must be registered after Monaco is loaded, which is handled in the `onMount` callback of the Editor component.

### TypeScript Configuration

The project uses a multi-configuration TypeScript setup:
- `tsconfig.json`: Root configuration with references
- `tsconfig.app.json`: App-specific configuration
- `tsconfig.node.json`: Node/Vite configuration

### Build Process

The build process runs TypeScript compilation (`tsc -b`) before Vite bundling to ensure type safety.

### Linting

ESLint is configured with:
- TypeScript ESLint recommended rules
- React Hooks plugin
- React Refresh plugin for Vite
- Strict type checking enabled

When making changes to the Lucene language definition, ensure:
1. Regex patterns don't use unnecessary escapes (ESLint will catch these)
2. All bracket definitions use the proper TypeScript interface format
3. Function parameters are properly typed (avoid `any`)
4. Unused function parameters use underscore prefix

### Testing the Implementation

The app includes comprehensive example queries that demonstrate all supported Lucene syntax features. When testing changes, verify that all syntax elements are properly highlighted according to the defined theme colors.