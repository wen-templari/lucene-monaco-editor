import { describe, it, expect } from 'vitest';
import { luceneLanguageDefinition } from './monarch.js';
import { LUCENE_CONSTANTS } from '@lucene-tools/core';

describe('luceneLanguageDefinition', () => {
  it('should export a valid Monaco Monarch language definition', () => {
    expect(luceneLanguageDefinition).toBeDefined();
    expect(luceneLanguageDefinition.tokenizer).toBeDefined();
    expect(luceneLanguageDefinition.tokenizer.root).toBeDefined();
  });

  it('should include Lucene constants', () => {
    expect(luceneLanguageDefinition.keywords).toEqual(LUCENE_CONSTANTS.keywords);
    expect(luceneLanguageDefinition.operators).toEqual(LUCENE_CONSTANTS.operators);
    expect(luceneLanguageDefinition.brackets).toEqual(LUCENE_CONSTANTS.brackets);
  });

  it('should have proper tokenizer rules structure', () => {
    const { tokenizer } = luceneLanguageDefinition;
    
    expect(tokenizer.root).toBeInstanceOf(Array);
    expect(tokenizer.rangeInclusive).toBeInstanceOf(Array);
    expect(tokenizer.rangeExclusive).toBeInstanceOf(Array);
    
    // Check that root has rules
    expect(tokenizer.root.length).toBeGreaterThan(0);
    expect(tokenizer.rangeInclusive.length).toBeGreaterThan(0);
    expect(tokenizer.rangeExclusive.length).toBeGreaterThan(0);
  });

  it('should have field query tokenizer rules', () => {
    const fieldRules = luceneLanguageDefinition.tokenizer.root.filter(rule => 
      Array.isArray(rule) && rule[1] === 'field'
    );
    expect(fieldRules.length).toBeGreaterThan(0);
  });

  it('should have keyword tokenizer rules', () => {
    const keywordRules = luceneLanguageDefinition.tokenizer.root.filter(rule => 
      Array.isArray(rule) && (rule[1] === 'keyword' || rule[1] === 'keyword.range')
    );
    expect(keywordRules.length).toBeGreaterThan(0);
  });

  it('should have range query states', () => {
    const { tokenizer } = luceneLanguageDefinition;
    
    // Check range states have TO keyword rules
    const inclusiveToRule = tokenizer.rangeInclusive.find(rule => 
      Array.isArray(rule) && rule[1] === 'keyword.range'
    );
    const exclusiveToRule = tokenizer.rangeExclusive.find(rule => 
      Array.isArray(rule) && rule[1] === 'keyword.range'
    );
    
    expect(inclusiveToRule).toBeDefined();
    expect(exclusiveToRule).toBeDefined();
  });

  it('should handle quoted field names', () => {
    const quotedFieldRule = luceneLanguageDefinition.tokenizer.root.find(rule => 
      Array.isArray(rule) && rule[1] === 'field.quoted'
    );
    expect(quotedFieldRule).toBeDefined();
  });

  it('should handle comparison operators', () => {
    const comparisonRules = luceneLanguageDefinition.tokenizer.root.filter(rule => 
      Array.isArray(rule) && rule[1] === 'operator.comparison'
    );
    expect(comparisonRules.length).toBeGreaterThan(0);
  });

  it('should handle string tokens', () => {
    const stringRules = luceneLanguageDefinition.tokenizer.root.filter(rule => 
      Array.isArray(rule) && (rule[1] === 'string' || rule[1] === 'string.proximity')
    );
    expect(stringRules.length).toBeGreaterThan(0);
  });

  it('should handle number tokens', () => {
    const numberRule = luceneLanguageDefinition.tokenizer.root.find(rule => 
      Array.isArray(rule) && rule[1] === 'number'
    );
    expect(numberRule).toBeDefined();
  });

  it('should handle date tokens', () => {
    const dateRules = luceneLanguageDefinition.tokenizer.root.filter(rule => 
      Array.isArray(rule) && rule[1] === 'date'
    );
    expect(dateRules.length).toBeGreaterThan(0);
  });

  it('should handle wildcard operators', () => {
    const wildcardRules = luceneLanguageDefinition.tokenizer.root.filter(rule => 
      Array.isArray(rule) && (rule[1] === 'operator.wildcard' || rule[1] === 'operator.wildcard.range')
    );
    expect(wildcardRules.length).toBeGreaterThan(0);
  });

  it('should handle fuzzy and boost operators', () => {
    const fuzzyRule = luceneLanguageDefinition.tokenizer.root.find(rule => 
      Array.isArray(rule) && rule[1] === 'operator.fuzzy'
    );
    const boostRule = luceneLanguageDefinition.tokenizer.root.find(rule => 
      Array.isArray(rule) && rule[1] === 'operator.boost'
    );
    
    expect(fuzzyRule).toBeDefined();
    expect(boostRule).toBeDefined();
  });

  it('should handle regular expressions', () => {
    const regexpRule = luceneLanguageDefinition.tokenizer.root.find(rule => 
      Array.isArray(rule) && rule[1] === 'regexp'
    );
    expect(regexpRule).toBeDefined();
  });
});