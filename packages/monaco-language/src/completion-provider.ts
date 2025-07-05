import type { languages } from 'monaco-editor';
import type { FieldSchema } from '@lucene-tools/core';
import { parseQueryContext, generateCompletions } from '@lucene-tools/core';

export function createCompletionProvider(
  monaco: typeof import('monaco-editor'),
  fieldSchema?: FieldSchema[]
): languages.CompletionItemProvider {
  return {
    triggerCharacters: [':', ' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '_', '-', '.'],
    
    provideCompletionItems: (model, position) => {
      // Parse query context for better completions
      const fullQuery = model.getValue();
      const cursorOffset = model.getOffsetAt(position);
      const context = parseQueryContext(fullQuery, cursorOffset);
      
      const word = model.getWordUntilPosition(position);
      const lineText = model.getLineContent(position.lineNumber);
      const textBeforeCursor = lineText.substring(0, position.column - 1);

      // Calculate proper range for replacement
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      // Generate platform-agnostic suggestions
      const coreSuggestions = generateCompletions(
        textBeforeCursor,
        word.word,
        context,
        fieldSchema
      );

      // Convert to Monaco format
      const monacoSuggestions: languages.CompletionItem[] = coreSuggestions.map(suggestion => ({
        label: suggestion.label,
        kind: getMonacoCompletionKind(monaco, suggestion.kind),
        insertText: suggestion.insertText,
        documentation: suggestion.documentation,
        range: range,
        sortText: suggestion.sortText,
        ...(suggestion.kind === 'snippet' ? {
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        } : {})
      }));

      // Add Monaco-specific snippets
      if (!context.isInRange) {
        monacoSuggestions.push(
          // Fuzzy search
          {
            label: 'fuzzy search',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '${1:term}~${2:distance}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Fuzzy search with optional edit distance',
            range: range,
          },
          // Proximity search
          {
            label: 'proximity search',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '"${1:phrase}"~${2:distance}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Proximity search - words within specified distance',
            range: range,
          },
          // Boost query
          {
            label: 'boost query',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '${1:term}^${2:boost}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Boost query - increase relevance score',
            range: range,
          },
          // Range queries
          {
            label: 'range inclusive',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '[${1:start} TO ${2:end}]',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Inclusive range query',
            range: range,
          },
          {
            label: 'range exclusive',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '{${1:start} TO ${2:end}}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Exclusive range query',
            range: range,
          },
          // Unbounded range queries
          {
            label: 'range from value',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '[${1:start} TO *]',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Range from value to infinity',
            range: range,
          },
          {
            label: 'range to value',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '[* TO ${1:end}]',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Range from negative infinity to value',
            range: range,
          },
          // Regular expression
          {
            label: 'regex',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '/${1:pattern}/',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Regular expression search',
            range: range,
          }
        );
      }

      return { suggestions: monacoSuggestions };
    }
  };
}

function getMonacoCompletionKind(
  monaco: typeof import('monaco-editor'),
  kind: string
): languages.CompletionItemKind {
  switch (kind) {
    case 'field':
      return monaco.languages.CompletionItemKind.Field;
    case 'operator':
      return monaco.languages.CompletionItemKind.Operator;
    case 'value':
      return monaco.languages.CompletionItemKind.Value;
    case 'keyword':
      return monaco.languages.CompletionItemKind.Keyword;
    case 'snippet':
      return monaco.languages.CompletionItemKind.Snippet;
    default:
      return monaco.languages.CompletionItemKind.Text;
  }
}