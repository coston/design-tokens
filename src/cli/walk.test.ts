import { describe, it, expect } from 'vitest';
import { walkTokenNodes } from './walk.js';

describe('walkTokenNodes', () => {
  it('visits leaf nodes with $value', () => {
    const tree = {
      color: { primary: { $value: '#000' }, secondary: { $value: '#FFF' } },
    };
    const visited: string[] = [];
    walkTokenNodes(tree, '', (_node, path) => visited.push(path));
    expect(visited).toEqual(['color.primary', 'color.secondary']);
  });

  it('skips $-prefixed properties', () => {
    const tree = {
      $schema: 'https://example.com',
      $description: 'Root',
      color: { $value: '#000' },
    };
    const visited: string[] = [];
    walkTokenNodes(tree, '', (_node, path) => visited.push(path));
    expect(visited).toEqual(['color']);
  });

  it('passes the node object to the visitor', () => {
    const tree = { token: { $value: '#ABC', $type: 'color' } };
    walkTokenNodes(tree, '', (node, _path) => {
      expect(node.$value).toBe('#ABC');
      expect(node.$type).toBe('color');
    });
  });

  it('handles deeply nested structures', () => {
    const tree = {
      a: { b: { c: { $value: 'deep' } } },
    };
    const visited: string[] = [];
    walkTokenNodes(tree, '', (_node, path) => visited.push(path));
    expect(visited).toEqual(['a.b.c']);
  });

  it('handles empty objects', () => {
    const visited: string[] = [];
    walkTokenNodes({}, '', (_node, path) => visited.push(path));
    expect(visited).toEqual([]);
  });
});
