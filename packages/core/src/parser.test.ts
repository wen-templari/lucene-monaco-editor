import { describe, it, expect } from 'vitest';
import { parseQueryContext, extractFieldContext } from './parser.js';

describe('parseQueryContext', () => {
  it('should identify field context', () => {
    const context = parseQueryContext('title:test', 5);
    expect(context.isInField).toBe(true);
    expect(context.isInValue).toBe(false);
  });

  it('should identify value context', () => {
    const context = parseQueryContext('title:test', 8);
    expect(context.isInField).toBe(false);
    expect(context.isInValue).toBe(true);
  });

  it('should identify range context', () => {
    const context = parseQueryContext('date:[2023-01-01 TO 2023-12-31]', 15);
    expect(context.isInRange).toBe(true);
  });

  it('should identify group context', () => {
    const context = parseQueryContext('(title:test OR content:test)', 10);
    expect(context.isInGroup).toBe(true);
  });

  it('should handle cursor at start', () => {
    const context = parseQueryContext('title:test', 0);
    expect(context.isInField).toBe(true);
  });

  it('should handle cursor at end', () => {
    const context = parseQueryContext('title:test', 10);
    expect(context.isInValue).toBe(true);
  });

  it('should handle empty query', () => {
    const context = parseQueryContext('', 0);
    expect(context.currentNode).toBe(null);
    expect(context.parentNode).toBe(null);
    expect(context.isInField).toBe(false);
    expect(context.isInValue).toBe(false);
  });
});

describe('extractFieldContext', () => {
  it('should extract field name from colon syntax', () => {
    const context = extractFieldContext('title:');
    expect(context.fieldName).toBe('title');
    expect(context.isAfterColon).toBe(true);
    expect(context.isAfterComparison).toBe(false);
  });

  it('should extract field name from comparison syntax', () => {
    const context = extractFieldContext('score>');
    expect(context.fieldName).toBe('score');
    expect(context.isAfterColon).toBe(false);
    expect(context.isAfterComparison).toBe(true);
  });

  it('should extract field name and partial value', () => {
    const context = extractFieldContext('title:test');
    expect(context.fieldName).toBe('title');
    expect(context.currentValue).toBe('test');
    expect(context.isAfterColon).toBe(false);
    expect(context.isAfterComparison).toBe(false);
  });

  it('should handle comparison operators', () => {
    const context = extractFieldContext('score>=');
    expect(context.fieldName).toBe('score');
    expect(context.isAfterComparison).toBe(true);
  });

  it('should handle less than operator', () => {
    const context = extractFieldContext('date<');
    expect(context.fieldName).toBe('date');
    expect(context.isAfterComparison).toBe(true);
  });

  it('should handle equals operator', () => {
    const context = extractFieldContext('status=');
    expect(context.fieldName).toBe('status');
    expect(context.isAfterComparison).toBe(true);
  });

  it('should return null for no field context', () => {
    const context = extractFieldContext('just some text');
    expect(context.fieldName).toBe(null);
    expect(context.currentValue).toBe('');
    expect(context.isAfterColon).toBe(false);
    expect(context.isAfterComparison).toBe(false);
  });

  it('should handle empty text', () => {
    const context = extractFieldContext('');
    expect(context.fieldName).toBe(null);
    expect(context.currentValue).toBe('');
    expect(context.isAfterColon).toBe(false);
    expect(context.isAfterComparison).toBe(false);
  });
});