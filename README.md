# Lucene Monaco Editor

A React-based Monaco Editor implementation with custom Lucene query syntax highlighting and intelligent completion support.

## Features

- **Complete Lucene Syntax Support**: Full syntax highlighting for Apache Lucene search queries
- **Intelligent Completion**: Smart autocompletion with configurable field schemas
- **Real-time Validation**: Live syntax validation as you type
- **Dark Theme**: Optimized dark theme with distinct colors for different token types
- **TypeScript Support**: Full TypeScript integration with type safety

## Lucene Syntax Highlighting

The editor provides comprehensive syntax highlighting for:

- **Field queries**: `field:value`
- **Boolean operators**: `AND`, `OR`, `NOT`, `&&`, `||`, `!`
- **Range queries**: `[a TO b]` (inclusive) and `{a TO b}` (exclusive)
- **Wildcard searches**: `*` (multiple characters), `?` (single character)
- **Fuzzy search**: `term~0.8` (with similarity)
- **Proximity search**: `"phrase"~10` (words within distance)
- **Boost queries**: `term^2.5` (relevance boosting)
- **Regular expressions**: `/pattern/`
- **Date formats**: ISO 8601 date recognition
- **Escaped characters**: `\+`, `\-`, `\*`, etc.

## Intelligent Completion

The completion system provides:

- **Field Name Suggestions**: Both default and custom field names
- **Field Value Suggestions**: Configurable values for specific fields
- **Operator Completions**: Boolean and special operators
- **Query Snippets**: Pre-built patterns for complex queries
- **Context-Aware Suggestions**: Different completions based on cursor position
- **Continuous Completion**: Completions trigger while typing after field colons

### Completion Triggers

Completions are triggered by:
- Typing `:` after a field name
- Any alphanumeric character (a-z, A-Z, 0-9)
- Special characters: `_`, `-`, `.`
- Space character for operator suggestions

## Installation

```bash
pnpm install
```

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

## Usage

### Basic Usage

```typescript
import { registerLuceneLanguage } from './lucene-monarch'
import { Editor } from '@monaco-editor/react'

function App() {
  const handleEditorDidMount = (editor: any, monaco: any) => {
    registerLuceneLanguage(monaco)
  }

  return (
    <Editor
      height="400px"
      defaultLanguage="lucene"
      defaultValue="title:example AND status:active"
      theme="lucene-theme"
      onMount={handleEditorDidMount}
    />
  )
}
```

### With Custom Field Schema

```typescript
const fieldSchema = [
  { key: 'level', values: ['info', 'warning', 'error'] },
  { key: 'category', values: ['frontend', 'backend', 'database'] }
]

const handleEditorDidMount = (editor: any, monaco: any) => {
  registerLuceneLanguage(monaco, fieldSchema)
}
```

## Field Schema Configuration

Define custom fields and their possible values:

```typescript
interface FieldSchema {
  key: string      // Field name
  values: string[] // Possible values for this field
}
```

Example queries with schema:
- `level:info` - Shows completion for 'info', 'warning', 'error'
- `category:front` - Shows filtered completion for 'frontend'

## Architecture

### Core Components

- **`lucene-monarch.ts`**: Main language definition and completion provider
- **`App.tsx`**: React component integrating Monaco with Lucene language
- **`FieldSchemaEditor.tsx`**: UI for configuring field schemas

### Language Definition

The Monaco Monarch tokenizer handles:
- Stateful parsing for range queries
- Context-sensitive token recognition
- Proper bracket matching and nesting

### Completion Provider

Features intelligent completion with:
- Context detection (after colon, in range, etc.)
- Field-specific value filtering
- Priority-based suggestion ordering
- Snippet-based complex query patterns

## Testing

The project includes comprehensive tests covering:
- Language definition structure
- Theme configuration
- Completion provider functionality
- Custom field schema integration
- All completion trigger scenarios

Run tests with:
```bash
pnpm test
```

## TypeScript Configuration

Multi-configuration setup:
- `tsconfig.json`: Root configuration
- `tsconfig.app.json`: Application-specific settings
- `tsconfig.node.json`: Node/Vite configuration

## Contributing

When making changes:

1. Ensure all tests pass: `pnpm test`
2. Run linting: `pnpm lint`
3. Build successfully: `pnpm build`
4. Follow existing code patterns and TypeScript conventions

## License

MIT