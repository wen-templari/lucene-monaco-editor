# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing Lucene language support tools including a core parsing library, Monaco Editor integration, React web editor, and VS Code extension. The project provides comprehensive Apache Lucene query syntax highlighting and intelligent completion across multiple platforms.

## Monorepo Structure

### Package Architecture
```
packages/
├── core/                    # @lucene-tools/core - Platform-agnostic parsing logic
├── monaco-language/         # @lucene-tools/monaco-language - Monaco Editor integration  
├── web-editor/             # @lucene-tools/web-editor - React web application
└── vscode-extension/       # lucene-language-support - VS Code extension
```

### Package Dependencies
- `@lucene-tools/core`: Pure TypeScript with no external dependencies
- `@lucene-tools/monaco-language`: Depends on core + Monaco Editor (peer dependency)
- `@lucene-tools/web-editor`: Depends on monaco-language + React stack
- `lucene-language-support`: Depends on core + VS Code API

## Development Commands

```bash
# Build all packages (required order due to dependencies)
pnpm build

# Start web editor development server
pnpm dev

# Run tests across all packages
pnpm test

# Run linting across all packages
pnpm lint

# Run type checking across all packages
pnpm typecheck

# Clean all build artifacts
pnpm clean

# Build specific package
pnpm --filter @lucene-tools/core build

# Add dependency to specific package
pnpm --filter @lucene-tools/web-editor add <dependency>

# Version management with Changeset
pnpm changeset          # Create a changeset for version bump
pnpm version-packages   # Apply changesets to update versions
pnpm release           # Build and publish packages to npm
```

## Key Architecture Components

### Core Package (`packages/core/`)
- **`tokenizer.ts`**: Lucene query tokenization with regex patterns
- **`parser.ts`**: Query context parsing and field extraction
- **`completion.ts`**: Completion suggestion generation
- **`types.ts`**: TypeScript type definitions for all interfaces

### Monaco Language Package (`packages/monaco-language/`)
- **`monarch.ts`**: Monaco Monarch language definition for Lucene syntax
- **`themes.ts`**: Dark and light theme definitions
- **`completion-provider.ts`**: Monaco completion provider integration
- **`register.ts`**: Main language registration function

### Web Editor Package (`packages/web-editor/`)
- **`App.tsx`**: Main React component with Monaco integration
- **`FieldSchemaEditor.tsx`**: Dynamic field schema configuration
- **`ThemeContext.tsx`**: Theme management with dark/light mode

### VS Code Extension Package (`packages/vscode-extension/`)
- **`extension.ts`**: Extension activation and language registration
- **`completionProvider.ts`**: VS Code completion provider
- **`lucene.tmLanguage.json`**: TextMate grammar for syntax highlighting

## Build Process

The build process follows dependency order:
1. TypeScript compilation (`tsc -b`) compiles all packages
2. Web editor runs Vite build for production bundle
3. VS Code extension packages with `vsce package`

## Monaco Editor Integration

Language registration happens in the `onMount` callback to ensure Monaco is fully loaded. The `registerLuceneLanguage()` function from monaco-language package handles:
- Language definition registration
- Theme application
- Completion provider setup
- Field schema configuration

## Lucene Syntax Support

Comprehensive support for Apache Lucene query syntax:
- Field queries with quoted field names
- Boolean operators (AND, OR, NOT, &&, ||, !)
- Range queries with inclusive/exclusive brackets
- Comparison operators (>, >=, <, <=, =)
- Wildcard and fuzzy searches
- Proximity and boost queries
- Regular expressions
- Date format recognition
- Escaped characters

## Testing Guidelines

- Use `pnpm test` for running test suites across all packages
- Use `pnpm test:coverage` for coverage reports
- Use `pnpm test:ui` for interactive test UI (web-editor only)
- Always run `pnpm build` and `pnpm lint` before committing
- Each package has its own test suite using Vitest

## Package-Specific Development

### Working on Core Logic
```bash
cd packages/core
pnpm test --watch    # Watch mode for TDD
pnpm typecheck      # Type checking
```

### Working on Monaco Integration
```bash
cd packages/monaco-language
pnpm test           # Test language definition
pnpm build          # Build for web-editor consumption
```

### Working on Web Editor
```bash
cd packages/web-editor
pnpm dev            # Development server
pnpm test:ui        # Interactive test runner
```

### Working on VS Code Extension
```bash
cd packages/vscode-extension
pnpm build          # Compile TypeScript
pnpm package        # Create .vsix package
```

## Release Management

This project uses [Changesets](https://github.com/changesets/changesets) for version management and automated releases.

### Creating a Release

1. **Add a changeset** when making changes that need to be released:
   ```bash
   pnpm changeset
   ```
   - Select which packages are affected
   - Choose the type of change (patch, minor, major)
   - Write a summary of the changes

2. **Version packages** to apply changesets:
   ```bash
   pnpm version-packages
   ```
   - Updates package.json versions
   - Generates/updates CHANGELOG.md files
   - Removes consumed changeset files

3. **Publish to npm**:
   ```bash
   pnpm release
   ```
   - Builds all packages
   - Publishes to npm registry

### Automated GitHub Releases

The project includes a GitHub Action (`.github/workflows/release.yml`) that:
- Runs on pushes to main branch
- Executes tests and builds
- **Creates "Version Packages" PRs** automatically when changesets are detected
- **Auto-publishes** to GitHub Packages when version PRs are merged
- **Creates GitHub Releases** with changelogs automatically

### Changeset Configuration

- **GitHub Package Registry**: Packages are published to GitHub Packages
- **Ignored packages**: `@lucene-tools/web-editor` is not published (private app)
- **Internal dependencies**: Updated with patch versions automatically
- **Base branch**: `main` branch for releases

### GitHub Package Registry

Packages are published to GitHub Package Registry under the `@lucene-tools` scope:
- **Registry URL**: `https://npm.pkg.github.com`
- **Package scope**: `@lucene-tools`
- **Authentication**: Uses `GITHUB_TOKEN` for publishing

To install packages from GitHub Registry:
```bash
# Configure npm to use GitHub registry for @lucene-tools scope
npm config set @lucene-tools:registry https://npm.pkg.github.com

# Install packages (requires GitHub authentication)
npm install @lucene-tools/core
npm install @lucene-tools/monaco-language
```

## Changeset Bot Workflow

The repository is configured with an automated Changeset bot workflow:

### How It Works
1. **Add changesets** to your feature branches:
   ```bash
   pnpm changeset
   ```

2. **Push to main** - The bot automatically:
   - Detects pending changesets
   - Creates a "Version Packages" PR with:
     - Updated package.json versions
     - Generated CHANGELOG.md entries
     - Consumed changeset files

3. **Merge the Version PR** - The bot automatically:
   - Publishes packages to GitHub Package Registry
   - Creates GitHub Releases with changelogs
   - Tags the release commits

### Bot Features
- **Automated versioning**: No manual version bumps needed
- **Changelog generation**: Automatic CHANGELOG.md updates
- **GitHub Releases**: Creates releases with proper tags
- **Package publishing**: Publishes to GitHub Packages
- **PR management**: Clean, predictable version PRs

### Workflow Permissions
The bot has the following permissions:
- `contents: write` - Create releases and tags
- `pull-requests: write` - Create and update version PRs
- `packages: write` - Publish to GitHub Packages
- `id-token: write` - Secure publishing authentication