# Lucene Language Tools

A monorepo containing tools and libraries for Apache Lucene query language support across multiple platforms.

## 📦 Packages

### `@lucene-tools/core`
[![npm version](https://badge.fury.io/js/%40lucene-tools%2Fcore.svg)](https://www.npmjs.com/package/@lucene-tools/core)

Platform-agnostic core library providing:
- Lucene query tokenization and parsing
- Syntax tree analysis
- Completion suggestion generation
- Field schema validation

### `@lucene-tools/monaco-language`
[![npm version](https://badge.fury.io/js/%40lucene-tools%2Fmonaco-language.svg)](https://www.npmjs.com/package/@lucene-tools/monaco-language)

Monaco Editor integration providing:
- Syntax highlighting with Monarch tokenizer
- Light and dark themes
- Intelligent auto-completion
- Context-aware suggestions

### `@lucene-tools/web-editor`
React web application featuring:
- Monaco-based Lucene query editor
- Real-time syntax highlighting
- Configurable field schemas
- Responsive design with Tailwind CSS

### `lucene-language-support` (VS Code Extension)
🎨 **Transform your Lucene queries in VS Code!**

This extension makes writing Apache Lucene queries a breeze with:
- 🌈 **Beautiful syntax highlighting** for `.lucene` files
- 🧠 **Smart auto-completion** as you type
- ⚙️ **Customizable field schemas** for your specific use case
- 🔍 **Real-time error detection** to catch mistakes early
- 📝 **Snippet support** for common query patterns

## 🚀 Quick Start

### Using npm Packages

Install the packages you need from npm:

```bash
# Core parsing library
pnpm add @lucene-tools/core

# Monaco Editor integration
pnpm add @lucene-tools/monaco-language

# Both packages together
pnpm add @lucene-tools/core @lucene-tools/monaco-language
```

### Using VS Code Extension

**Install from VS Code Marketplace:**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Lucene Language Support"
4. Click Install

**Or install from command line:**
```bash
code --install-extension lucene-language-support
```

### Usage Examples

#### Using @lucene-tools/core

```typescript
import { tokenize, parse, generateCompletions } from '@lucene-tools/core';

// Tokenize a Lucene query
const tokens = tokenize('field:value AND status:active');

// Parse query for context analysis
const context = parse('field:val');

// Generate completions
const schema = {
  fields: ['title', 'description', 'status'],
  values: { status: ['active', 'inactive', 'pending'] }
};
const completions = generateCompletions('stat', schema);
```

#### Using @lucene-tools/monaco-language

```typescript
import * as monaco from 'monaco-editor';
import { registerLuceneLanguage } from '@lucene-tools/monaco-language';

// Register Lucene language support
registerLuceneLanguage(monaco, {
  schema: {
    fields: ['title', 'description', 'status'],
    values: { status: ['active', 'inactive', 'pending'] }
  }
});

// Create editor with Lucene support
const editor = monaco.editor.create(document.getElementById('editor'), {
  value: 'title:"hello world" AND status:active',
  language: 'lucene',
  theme: 'lucene-dark'
});
```

#### Using VS Code Extension

**Getting Started:**
1. Create a file with `.lucene` extension (e.g., `search-queries.lucene`)
2. Start typing your Lucene query - syntax highlighting activates automatically
3. Use Ctrl+Space to trigger auto-completion suggestions

**Example queries to try:**
```lucene
// Basic field search
title:"hello world" AND status:active

// Range queries with dates
created:[2023-01-01 TO 2023-12-31]

// Fuzzy search with boost
title:search~0.8^2 OR description:find

// Complex boolean query
(category:technology OR category:science) AND published:true
```

**Configure field schemas** by adding to your VS Code settings:
```json
{
  "lucene.fieldSchema": {
    "fields": ["title", "description", "category", "status", "published"],
    "values": {
      "status": ["active", "inactive", "pending"],
      "category": ["technology", "science", "business"],
      "published": ["true", "false"]
    }
  }
}
```

### Development Setup

#### Prerequisites
- Node.js 18+
- pnpm 8+

#### Installation
```bash
pnpm install
```

### Development
```bash
# Build all packages
pnpm build

# Start web editor development server
pnpm dev

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint
```

## 🏗️ Architecture

```
lucene-language-tools/
├── packages/
│   ├── core/                    # Platform-agnostic core logic
│   ├── monaco-language/         # Monaco Editor integration
│   ├── web-editor/              # React web application
│   └── vscode-extension/        # VS Code extension
├── package.json                 # Root workspace configuration
└── pnpm-workspace.yaml         # pnpm workspace setup
```

### Package Dependencies
- `@lucene-tools/core` → No dependencies (pure TypeScript)
- `@lucene-tools/monaco-language` → Depends on core + Monaco Editor
- `@lucene-tools/web-editor` → Depends on monaco-language + React
- `lucene-language-support` → Depends on core + VS Code API

## 🛠️ Development

### Adding Dependencies
```bash
# Add to specific package
pnpm --filter @lucene-tools/core add <dependency>

# Add to root workspace
pnpm add -w <dependency>
```

### Building Packages
```bash
# Build all packages
pnpm -r build

# Build specific package
pnpm --filter @lucene-tools/core build
```

### Testing
```bash
# Test all packages
pnpm -r test

# Test with coverage
pnpm -r test:coverage
```

## 📝 Features

### Lucene Syntax Support
- **Field queries**: `field:value`, `"quoted field":value`
- **Comparison operators**: `>`, `>=`, `<`, `<=`, `=`
- **Boolean operators**: `AND`, `OR`, `NOT`, `&&`, `||`, `!`
- **Range queries**: `[start TO end]`, `{start TO end}`
- **Unbounded ranges**: `[value TO *]`, `[* TO value]`
- **Wildcard searches**: `*`, `?`
- **Fuzzy search**: `term~0.8`
- **Proximity search**: `"phrase"~10`
- **Boost queries**: `term^2.5`
- **Regular expressions**: `/pattern/`
- **Date formats**: ISO 8601, US format
- **Escaped characters**: `\\`, `\+`, `\-`, etc.

### Smart Completions
- Context-aware field suggestions
- Field-specific value completions
- Operator and keyword suggestions
- Snippet completions for complex patterns
- Configurable field schemas

## 🎨 Themes

Both light and dark themes with distinct colors for:
- Field names (blue)
- Keywords (purple)
- Operators (various colors by type)
- Strings and dates (orange/red)
- Numbers (green)
- Regular expressions (red)

## 📄 License

MIT License - see individual packages for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `pnpm build` and `pnpm test`
6. Submit a pull request

## 🔗 Related Projects

- [Apache Lucene](https://lucene.apache.org/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [VS Code Language Extensions](https://code.visualstudio.com/api/language-extensions/overview)