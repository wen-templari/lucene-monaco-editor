import type { FieldSchema, CompletionSuggestion, QueryContext } from './types.js';
import { extractFieldContext } from './parser.js';

/**
 * Generate completion suggestions based on query context
 */
export function generateCompletions(
  textBeforeCursor: string,
  word: string,
  context: QueryContext,
  fieldSchema?: FieldSchema[]
): CompletionSuggestion[] {
  const suggestions: CompletionSuggestion[] = [];
  const fieldContext = extractFieldContext(textBeforeCursor);
  
  const isInRange = context.isInRange;
  const isAfterOperator = /\b(AND|OR|NOT|&&|\|\||!|\+|-)\s*$/.test(textBeforeCursor);
  const isAtStart = textBeforeCursor.trim() === '' || isAfterOperator;
  const isTypingField = !fieldContext.isAfterColon && !fieldContext.isAfterComparison && !isInRange && word.length > 0;

  // Enhanced context-aware suggestions using syntax tree
  if (context.isInRange) {
    // In range context, prioritize range-specific completions
    suggestions.push({
      label: 'TO',
      insertText: 'TO ',
      documentation: 'Range query separator',
      kind: 'keyword'
    });
    
    suggestions.push({
      label: '*',
      insertText: '*',
      documentation: 'Unbounded range wildcard',
      kind: 'operator'
    });
  }
  
  // Check if we're typing after a field colon or comparison operator for field-specific value suggestions
  if ((fieldContext.isAfterColon || fieldContext.isAfterComparison || fieldContext.fieldName) && fieldSchema) {
    const schemaField = fieldSchema.find(f => f.key === fieldContext.fieldName);
    if (schemaField) {
      // Filter values based on what user is typing after colon
      const filteredValues = fieldContext.currentValue 
        ? schemaField.values.filter(value => value.toLowerCase().startsWith(fieldContext.currentValue.toLowerCase()))
        : schemaField.values;
      
      filteredValues.forEach(value => {
        suggestions.push({
          label: value,
          insertText: value,
          documentation: `${fieldContext.fieldName} field value`,
          kind: 'value'
        });
      });
      // Return early to show only field-specific values if not in range
      if (!context.isInRange) {
        return suggestions;
      }
    }
  }

  // Field name suggestions - enhanced with context awareness
  if ((isAtStart || isAfterOperator || isTypingField) && !context.isInRange) {
    // Default field names
    const defaultFields = [
      'title', 'author', 'content', 'text', 'date', 'category', 
      'status', 'priority', 'score', 'name', 'description', 'tags'
    ];
    
    // Add custom fields from schema
    const customFields = fieldSchema ? fieldSchema.map(f => f.key) : [];
    const allFields = [...defaultFields, ...customFields];
    
    // Remove duplicates
    const uniqueFields = [...new Set(allFields)];
    
    // Filter fields based on what user is typing
    const filteredFields = isTypingField 
      ? uniqueFields.filter(field => field.toLowerCase().startsWith(word.toLowerCase()))
      : uniqueFields;
    
    filteredFields.forEach(field => {
      const isCustomField = fieldSchema?.some(f => f.key === field);
      // Show field values in documentation for custom fields
      const fieldValues = isCustomField ? fieldSchema?.find(f => f.key === field)?.values : [];
      const valuePreview = fieldValues && fieldValues.length > 0 
        ? ` (values: ${fieldValues.slice(0, 3).join(', ')}${fieldValues.length > 3 ? '...' : ''})`
        : '';
      
      suggestions.push({
        label: field,
        insertText: field + ':',
        documentation: isCustomField 
          ? `Custom field: ${field}${valuePreview}` 
          : `Search in ${field} field`,
        kind: 'field',
        sortText: isCustomField ? `0${field}` : `1${field}` // Prioritize custom fields
      });
    });
  }

  // Operator suggestions - enhanced with context awareness
  if (!isInRange && !context.isInRange) {
    const operators = [
      { label: 'AND', doc: 'Boolean AND operator' },
      { label: 'OR', doc: 'Boolean OR operator' },
      { label: 'NOT', doc: 'Boolean NOT operator' },
      { label: '&&', doc: 'Boolean AND operator (alternative)' },
      { label: '||', doc: 'Boolean OR operator (alternative)' },
      { label: '!', doc: 'Boolean NOT operator (alternative)' },
      { label: '+', doc: 'Required term' },
      { label: '-', doc: 'Prohibited term' },
      { label: '>', doc: 'Greater than comparison' },
      { label: '>=', doc: 'Greater than or equal comparison' },
      { label: '<', doc: 'Less than comparison' },
      { label: '<=', doc: 'Less than or equal comparison' },
      { label: '=', doc: 'Exact equality comparison' }
    ];
    
    operators.forEach(op => {
      suggestions.push({
        label: op.label,
        insertText: op.label + ' ',
        documentation: op.doc,
        kind: 'operator'
      });
    });
  }

  return suggestions;
}