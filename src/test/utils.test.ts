import { describe, it, expect } from 'vitest';
import { assert, randomChoice, assertOK, unreachable } from '../utils/util';

describe('Utils', () => {
  describe('assert', () => {
    it('should not throw when condition is true', () => {
      expect(() => assert(true, 'Should not throw')).not.toThrow();
    });

    it('should throw when condition is false', () => {
      expect(() => assert(false, 'Should throw')).toThrow('Should throw');
    });

    it('should throw default message when no message provided', () => {
      expect(() => assert(false)).toThrow('Assertion failed');
    });
  });

  describe('randomChoice', () => {
    it('should return element from array', () => {
      const choices = [1, 2, 3, 4, 5];
      const result = randomChoice(choices);
      expect(choices).toContain(result);
    });

    it('should return single element from single-element array', () => {
      const choices = ['only'];
      const result = randomChoice(choices);
      expect(result).toBe('only');
    });

    it('should throw when array is empty', () => {
      expect(() => randomChoice([])).toThrow('Cannot select from empty array');
    });
  });

  describe('assertOK', () => {
    it('should return value when not Error', () => {
      const value = 'test';
      expect(assertOK(value)).toBe(value);
    });

    it('should throw when value is Error', () => {
      const error = new Error('test error');
      expect(() => assertOK(error)).toThrow('test error');
    });
  });

  describe('unreachable', () => {
    it('should always throw', () => {
      expect(() => unreachable()).toThrow();
      expect(() => unreachable('custom message')).toThrow('custom message');
    });
  });
});