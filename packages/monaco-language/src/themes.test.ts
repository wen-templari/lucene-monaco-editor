import { describe, it, expect } from 'vitest';
import { luceneDarkTheme, luceneLightTheme } from './themes.js';

describe('luceneDarkTheme', () => {
  it('should be a valid Monaco theme definition', () => {
    expect(luceneDarkTheme).toBeDefined();
    expect(luceneDarkTheme.base).toBe('vs-dark');
    expect(luceneDarkTheme.inherit).toBe(true);
    expect(luceneDarkTheme.rules).toBeInstanceOf(Array);
    expect(luceneDarkTheme.colors).toBeDefined();
  });

  it('should define field token styling', () => {
    const fieldRule = luceneDarkTheme.rules.find(rule => rule.token === 'field');
    const quotedFieldRule = luceneDarkTheme.rules.find(rule => rule.token === 'field.quoted');
    
    expect(fieldRule).toBeDefined();
    expect(fieldRule?.foreground).toBeDefined();
    expect(quotedFieldRule).toBeDefined();
    expect(quotedFieldRule?.foreground).toBeDefined();
  });

  it('should define keyword token styling', () => {
    const keywordRule = luceneDarkTheme.rules.find(rule => rule.token === 'keyword');
    const rangeKeywordRule = luceneDarkTheme.rules.find(rule => rule.token === 'keyword.range');
    
    expect(keywordRule).toBeDefined();
    expect(keywordRule?.foreground).toBeDefined();
    expect(keywordRule?.fontStyle).toBe('bold');
    expect(rangeKeywordRule).toBeDefined();
    expect(rangeKeywordRule?.foreground).toBeDefined();
  });

  it('should define operator token styling', () => {
    const operatorRules = luceneDarkTheme.rules.filter(rule => 
      rule.token.startsWith('operator')
    );
    
    expect(operatorRules.length).toBeGreaterThan(0);
    operatorRules.forEach(rule => {
      expect(rule.foreground).toBeDefined();
    });
  });

  it('should define string token styling', () => {
    const stringRules = luceneDarkTheme.rules.filter(rule => 
      rule.token.startsWith('string')
    );
    
    expect(stringRules.length).toBeGreaterThan(0);
    stringRules.forEach(rule => {
      expect(rule.foreground).toBeDefined();
    });
  });

  it('should define delimiter token styling', () => {
    const delimiterRules = luceneDarkTheme.rules.filter(rule => 
      rule.token.startsWith('delimiter')
    );
    
    expect(delimiterRules.length).toBeGreaterThan(0);
    delimiterRules.forEach(rule => {
      expect(rule.foreground).toBeDefined();
    });
  });

  it('should define all standard Lucene token types', () => {
    const requiredTokens = [
      'field', 'field.quoted', 'keyword', 'keyword.range', 'operator',
      'string', 'number', 'date', 'regexp', 'identifier'
    ];
    
    requiredTokens.forEach(token => {
      const rule = luceneDarkTheme.rules.find(r => r.token === token);
      expect(rule, `Missing rule for token: ${token}`).toBeDefined();
      expect(rule?.foreground, `Missing foreground for token: ${token}`).toBeDefined();
    });
  });
});

describe('luceneLightTheme', () => {
  it('should be a valid Monaco theme definition', () => {
    expect(luceneLightTheme).toBeDefined();
    expect(luceneLightTheme.base).toBe('vs');
    expect(luceneLightTheme.inherit).toBe(true);
    expect(luceneLightTheme.rules).toBeInstanceOf(Array);
    expect(luceneLightTheme.colors).toBeDefined();
  });

  it('should define field token styling', () => {
    const fieldRule = luceneLightTheme.rules.find(rule => rule.token === 'field');
    const quotedFieldRule = luceneLightTheme.rules.find(rule => rule.token === 'field.quoted');
    
    expect(fieldRule).toBeDefined();
    expect(fieldRule?.foreground).toBeDefined();
    expect(quotedFieldRule).toBeDefined();
    expect(quotedFieldRule?.foreground).toBeDefined();
  });

  it('should define keyword token styling', () => {
    const keywordRule = luceneLightTheme.rules.find(rule => rule.token === 'keyword');
    const rangeKeywordRule = luceneLightTheme.rules.find(rule => rule.token === 'keyword.range');
    
    expect(keywordRule).toBeDefined();
    expect(keywordRule?.foreground).toBeDefined();
    expect(keywordRule?.fontStyle).toBe('bold');
    expect(rangeKeywordRule).toBeDefined();
    expect(rangeKeywordRule?.foreground).toBeDefined();
  });

  it('should define all standard Lucene token types', () => {
    const requiredTokens = [
      'field', 'field.quoted', 'keyword', 'keyword.range', 'operator',
      'string', 'number', 'date', 'regexp', 'identifier'
    ];
    
    requiredTokens.forEach(token => {
      const rule = luceneLightTheme.rules.find(r => r.token === token);
      expect(rule, `Missing rule for token: ${token}`).toBeDefined();
      expect(rule?.foreground, `Missing foreground for token: ${token}`).toBeDefined();
    });
  });

  it('should have different colors from dark theme', () => {
    const darkFieldRule = luceneDarkTheme.rules.find(rule => rule.token === 'field');
    const lightFieldRule = luceneLightTheme.rules.find(rule => rule.token === 'field');
    
    expect(darkFieldRule?.foreground).not.toBe(lightFieldRule?.foreground);
  });

  it('should use appropriate light theme colors', () => {
    // Light theme should generally use darker colors since background is light
    const fieldRule = luceneLightTheme.rules.find(rule => rule.token === 'field');
    const stringRule = luceneLightTheme.rules.find(rule => rule.token === 'string');
    
    // These are darker colors appropriate for light backgrounds
    expect(fieldRule?.foreground).toBe('0451A5'); // Darker blue
    expect(stringRule?.foreground).toBe('A31515'); // Red
  });
});