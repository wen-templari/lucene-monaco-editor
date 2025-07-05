import * as vscode from 'vscode';
import { parseQueryContext, generateCompletions, type FieldSchema } from '@lucene-tools/core';

export class CompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    
    // Get the current line and text before cursor
    const lineText = document.lineAt(position).text;
    const textBeforeCursor = lineText.substring(0, position.character);
    const wordRange = document.getWordRangeAtPosition(position);
    const word = wordRange ? document.getText(wordRange) : '';

    // Parse query context
    const fullQuery = document.getText();
    const cursorOffset = document.offsetAt(position);
    const queryContext = parseQueryContext(fullQuery, cursorOffset);

    // Get field schema from configuration
    const config = vscode.workspace.getConfiguration('lucene');
    const fieldSchema: FieldSchema[] = config.get('fieldSchema', []);

    // Generate core suggestions
    const coreSuggestions = generateCompletions(
      textBeforeCursor,
      word,
      queryContext,
      fieldSchema
    );

    // Convert to VS Code completion items
    const completionItems = coreSuggestions.map(suggestion => {
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