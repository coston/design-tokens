import { describe, it, expect } from 'vitest';
import {
  findBrackets,
  partition,
  roundTo,
  round3Decimals,
  formatValue,
  range,
  mapRange,
} from './functional-utils.js';

describe('Functional Utils', () => {
  describe('partition', () => {
    it('should split array into pass and fail groups', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const [evens, odds] = partition(numbers, n => n % 2 === 0);

      expect(evens).toEqual([2, 4, 6]);
      expect(odds).toEqual([1, 3, 5]);
    });

    it('should handle all items passing predicate', () => {
      const numbers = [2, 4, 6, 8];
      const [evens, odds] = partition(numbers, n => n % 2 === 0);

      expect(evens).toEqual([2, 4, 6, 8]);
      expect(odds).toEqual([]);
    });

    it('should handle all items failing predicate', () => {
      const numbers = [1, 3, 5, 7];
      const [evens, odds] = partition(numbers, n => n % 2 === 0);

      expect(evens).toEqual([]);
      expect(odds).toEqual([1, 3, 5, 7]);
    });

    it('should handle empty array', () => {
      const [pass, fail] = partition([], () => true);

      expect(pass).toEqual([]);
      expect(fail).toEqual([]);
    });

    it('should work with objects and complex predicates', () => {
      const items = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 17 },
        { name: 'Charlie', age: 30 },
        { name: 'Diana', age: 16 },
      ];
      const [adults, minors] = partition(items, item => item.age >= 18);

      expect(adults).toHaveLength(2);
      expect(minors).toHaveLength(2);
      expect(adults[0].name).toBe('Alice');
      expect(minors[0].name).toBe('Bob');
    });
  });

  describe('roundTo', () => {
    it('should round to specified decimal places', () => {
      const round2 = roundTo(2);
      expect(round2(3.14159)).toBe(3.14);
      expect(round2(2.567)).toBe(2.57);
    });

    it('should handle zero decimals', () => {
      const round0 = roundTo(0);
      expect(round0(3.7)).toBe(4);
      expect(round0(3.2)).toBe(3);
    });
  });

  describe('round3Decimals', () => {
    it('should round to 3 decimal places', () => {
      expect(round3Decimals(3.14159265)).toBe(3.142);
      expect(round3Decimals(2.5)).toBe(2.5);
    });
  });

  describe('formatValue', () => {
    it('should format value with unit suffix', () => {
      const formatRem = formatValue('rem');
      expect(formatRem(1.5)).toBe('1.5rem');
      expect(formatRem(2.12345)).toBe('2.123rem');
    });

    it('should work with different units', () => {
      const formatPx = formatValue('px');
      expect(formatPx(16)).toBe('16px');
    });
  });

  describe('range', () => {
    it('should create array of numbers from 0 to n-1', () => {
      expect(range(5)).toEqual([0, 1, 2, 3, 4]);
      expect(range(3)).toEqual([0, 1, 2]);
    });

    it('should handle zero', () => {
      expect(range(0)).toEqual([]);
    });
  });

  describe('mapRange', () => {
    it('should create range with mapping function', () => {
      const doubled = mapRange(4, i => i * 2);
      expect(doubled).toEqual([0, 2, 4, 6]);
    });

    it('should work with complex transformations', () => {
      const squares = mapRange(3, i => i * i);
      expect(squares).toEqual([0, 1, 4]);
    });
  });

  describe('findBrackets', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0.25, y: 0.5 },
      { x: 0.5, y: 1.05 },
      { x: 0.65, y: 1.05 },
      { x: 0.9, y: 0.7 },
      { x: 1.0, y: 0.2 },
    ];

    it('should find bracketing elements', () => {
      const [lower, upper] = findBrackets(points, 0.3, p => p.x);
      expect(lower.x).toBe(0.25);
      expect(upper.x).toBe(0.5);
    });

    it('should handle value at exact point', () => {
      const [lower, upper] = findBrackets(points, 0.5, p => p.x);
      expect(lower.x).toBe(0.25);
      expect(upper.x).toBe(0.5);
    });

    it('should handle value below range', () => {
      const [lower, upper] = findBrackets(points, -0.1, p => p.x);
      expect(lower).toBe(points[0]);
      expect(upper).toBe(points[points.length - 1]);
    });

    it('should handle value above range', () => {
      const [lower, upper] = findBrackets(points, 1.5, p => p.x);
      expect(lower).toBe(points[0]);
      expect(upper).toBe(points[points.length - 1]);
    });

    it('should work with numeric arrays', () => {
      const numbers = [{ val: 1 }, { val: 5 }, { val: 10 }];
      const [lower, upper] = findBrackets(numbers, 7, n => n.val);
      expect(lower.val).toBe(5);
      expect(upper.val).toBe(10);
    });

    it('should handle two-element array', () => {
      const twoPoints = [{ x: 0 }, { x: 1 }];
      const [lower, upper] = findBrackets(twoPoints, 0.5, p => p.x);
      expect(lower.x).toBe(0);
      expect(upper.x).toBe(1);
    });
  });
});
