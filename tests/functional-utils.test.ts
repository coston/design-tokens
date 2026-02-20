import { describe, it, expect } from 'vitest';
import { findBrackets } from '../src/build/utils/functional-utils.js';

describe('Functional Utils', () => {
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
