import { describe, it, expect } from 'vitest';
import { tokenizeQuery, LUCENE_CONSTANTS } from './tokenizer.js';

describe('tokenizeQuery', () => {
  it('should tokenize field queries', () => {
    const tokens = tokenizeQuery('title:test');
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toMatchObject({
      type: 'field',
      value: 'title',
      start: 0,
      end: 5
    });
    expect(tokens[1]).toMatchObject({
      type: 'operator',
      value: ':',
      start: 5,
      end: 6
    });
    expect(tokens[2]).toMatchObject({
      type: 'value',
      value: 'test',
      start: 6,
      end: 10
    });
  });

  it('should tokenize operators', () => {
    const tokens = tokenizeQuery('title:test AND author:john');
    const andToken = tokens.find(t => t.value === 'AND');
    expect(andToken).toMatchObject({
      type: 'operator',
      value: 'AND'
    });
  });

  it('should tokenize range queries', () => {
    const tokens = tokenizeQuery('date:[2023-01-01 TO 2023-12-31]');
    const rangeToken = tokens.find(t => t.type === 'range');
    expect(rangeToken).toMatchObject({
      type: 'range',
      value: '[2023-01-01 TO 2023-12-31]'
    });
  });

  it('should tokenize group queries', () => {
    const tokens = tokenizeQuery('(title:test OR content:test)');
    const groupToken = tokens.find(t => t.type === 'group');
    expect(groupToken).toMatchObject({
      type: 'group',
      value: '(title:test OR content:test)'
    });
  });

  it('should tokenize quoted values', () => {
    const tokens = tokenizeQuery('title:"hello world"');
    const quotedToken = tokens.find(t => t.value === '"hello world"');
    expect(quotedToken).toMatchObject({
      type: 'value',
      value: '"hello world"'
    });
  });

  it('should handle comparison operators', () => {
    const tokens = tokenizeQuery('score>5');
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toMatchObject({
      type: 'field',
      value: 'score'
    });
    expect(tokens[1]).toMatchObject({
      type: 'operator',
      value: '>'
    });
    expect(tokens[2]).toMatchObject({
      type: 'value',
      value: '5'
    });
  });

  it('should handle empty query', () => {
    const tokens = tokenizeQuery('');
    expect(tokens).toHaveLength(0);
  });
});

describe('LUCENE_CONSTANTS', () => {
  it('should contain expected keywords', () => {
    expect(LUCENE_CONSTANTS.keywords).toContain('AND');
    expect(LUCENE_CONSTANTS.keywords).toContain('OR');
    expect(LUCENE_CONSTANTS.keywords).toContain('NOT');
    expect(LUCENE_CONSTANTS.keywords).toContain('TO');
  });

  it('should contain expected operators', () => {
    expect(LUCENE_CONSTANTS.operators).toContain('+');
    expect(LUCENE_CONSTANTS.operators).toContain('-');
    expect(LUCENE_CONSTANTS.operators).toContain('~');
    expect(LUCENE_CONSTANTS.operators).toContain('^');
  });

  it('should contain bracket definitions', () => {
    expect(LUCENE_CONSTANTS.brackets).toHaveLength(3);
    expect(LUCENE_CONSTANTS.brackets[0]).toMatchObject({
      open: '(',
      close: ')',
      token: 'delimiter.parenthesis'
    });
  });
});