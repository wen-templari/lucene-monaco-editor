import * as vscode from 'vscode';
import { type FieldSchema, type CompletionSuggestion } from '../types';

export class CompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    
    // Get the current line and text before cursor
    const lineText = document.lineAt(position).text;
    const textBeforeCursor = lineText.substring(0, position.character);
    const wordRange = document.getWordRangeAtPosition(position);
    const word = wordRange ? document.getText(wordRange) : '';

    // Get field schema from configuration
    const config = vscode.workspace.getConfiguration('lucene');
    const fieldSchema: FieldSchema[] = config.get('fieldSchema', []);

    // Generate basic completions
    const suggestions = this.generateBasicCompletions(textBeforeCursor, word, fieldSchema);

    // Convert to VS Code completion items
    const completionItems = suggestions.map((suggestion: CompletionSuggestion) => {
      const item = new vscode.CompletionItem(suggestion.label, this.getCompletionItemKind(suggestion.kind));
      item.insertText = suggestion.insertText;
      item.documentation = suggestion.documentation;
      item.sortText = suggestion.sortText;
      
      if (suggestion.kind === 'snippet') {
        item.insertText = new vscode.SnippetString(suggestion.insertText);
      }
      
      return item;
    });

    return completionItems;
  }

  private generateBasicCompletions(textBeforeCursor: string, word: string, fieldSchema: FieldSchema[]): CompletionSuggestion[] {
    const suggestions: CompletionSuggestion[] = [];
    
    // Check if we're after a field name (after colon)
    const fieldMatch = textBeforeCursor.match(/(\w+):\s*$/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      const schema = fieldSchema.find(f => f.key === fieldName);
      if (schema) {
        schema.values.forEach(value => {
          suggestions.push({
            label: value,
            kind: 'value',
            insertText: value,
            detail: `Value for ${fieldName}`,
            sortText: `1_${value}`
          });
        });
      }
    } else {
      // Field name suggestions
      fieldSchema.forEach(field => {
        suggestions.push({
          label: field.key,
          kind: 'field',
          insertText: field.key + ':',
          detail: `Field: ${field.key}`,
          sortText: `2_${field.key}`
        });
      });

      // Operator suggestions
      ['AND', 'OR', 'NOT', 'TO'].forEach(op => {
        suggestions.push({
          label: op,
          kind: 'keyword',
          insertText: op,
          detail: `Operator: ${op}`,
          sortText: `3_${op}`
        });
      });
    }

    return suggestions;
  }

  private getCompletionItemKind(kind: string): vscode.CompletionItemKind {
    switch (kind) {
      case 'field':
        return vscode.CompletionItemKind.Field;
      case 'operator':
        return vscode.CompletionItemKind.Operator;
      case 'value':
        return vscode.CompletionItemKind.Value;
      case 'keyword':
        return vscode.CompletionItemKind.Keyword;
      case 'snippet':
        return vscode.CompletionItemKind.Snippet;
      default:
        return vscode.CompletionItemKind.Text;
    }
  }
}