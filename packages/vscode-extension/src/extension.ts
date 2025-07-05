import * as vscode from 'vscode';
import { CompletionProvider } from './providers/completionProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Lucene Language Support extension is now active!');

  // Register completion provider
  const completionProvider = new CompletionProvider();
  const completionDisposable = vscode.languages.registerCompletionItemProvider(
    'lucene',
    completionProvider,
    ':', ' ', '.', '-', '_'
  );

  context.subscriptions.push(completionDisposable);
}

export function deactivate() {
  // Clean up resources if needed
}