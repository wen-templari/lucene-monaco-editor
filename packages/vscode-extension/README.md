# Publishing VS Code Extension

## Prerequisites

1. **Install Visual Studio Code Extension Manager (vsce)**:
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Create a Microsoft/Azure DevOps account**:
   - Go to https://marketplace.visualstudio.com/manage
   - Sign in with Microsoft account
   - Create a publisher account

## Publishing Steps

### 1. Update Publisher Information

Edit `package.json` and update the `publisher` field with your actual publisher name:

```json
{
  "publisher": "your-publisher-name"
}
```

### 2. Build the Extension

```bash
# From the vscode-extension directory
pnpm install
pnpm build
```

### 3. Package the Extension

```bash
# Create a .vsix file
vsce package
```

This creates a `.vsix` file you can install locally or publish.

### 4. Test Locally

```bash
# Install the extension locally for testing
code --install-extension lucene-language-support-1.0.0.vsix
```

### 5. Publish to Marketplace

```bash
# Login with your publisher account
vsce login your-publisher-name

# Publish the extension
vsce publish
```

## Alternative: Manual Upload

1. Go to https://marketplace.visualstudio.com/manage
2. Click "New extension" → "Visual Studio Code"
3. Upload the `.vsix` file created by `vsce package`

## Extension Features

- **Syntax Highlighting**: Full Lucene query syntax support
- **IntelliSense**: Context-aware completions for fields and operators
- **File Support**: `.lucene` and `.lql` file extensions
- **Configuration**: Customizable field schemas via VS Code settings

## Configuration

Users can configure field schemas in their VS Code settings:

```json
{
  "lucene.fieldSchema": [
    {
      "key": "title",
      "values": ["article", "blog", "news"]
    },
    {
      "key": "status",
      "values": ["active", "inactive", "pending"]
    }
  ]
}
```

## Testing

Create a test `.lucene` file with content like:

```lucene
title:"search query" AND status:active
price:[100 TO 500]
author:john* OR category:electronics
```

The extension should provide syntax highlighting and completions.