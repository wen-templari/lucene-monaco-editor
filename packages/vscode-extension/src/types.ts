// Inline types for VS Code extension to avoid workspace dependency issues
export interface FieldSchema {
  key: string;
  values: string[];
}

export interface CompletionSuggestion {
  label: string;
  kind: string;
  insertText: string;
  detail?: string;
  documentation?: string;
  sortText?: string;
}

export interface QueryContext {
  isInField: boolean;
  isInValue: boolean;
  isInRange: boolean;
  currentField?: string;
  precedingText: string;
}