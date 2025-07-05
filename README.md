# Lucene Language Tools

A monorepo containing tools and libraries for Apache Lucene query language support across multiple platforms.

## 📦 Packages

### `@lucene-tools/core`
Platform-agnostic core library providing:
- Lucene query tokenization and parsing
- Syntax tree analysis
- Completion suggestion generation
- Field schema validation

### `@lucene-tools/monaco-language`
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
VS Code extension providing:
- Lucene syntax highlighting for `.lucene` files
- IntelliSense completions
- Configurable field schemas
- Error detection and validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation
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