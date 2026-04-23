/**
 * Shared tree-walking utility for W3C DTCG token objects.
 *
 * Every walker in lint.ts and fix.ts follows the same pattern:
 * "if $value exists, visit the token node; otherwise recurse children."
 * This module extracts that into a single reusable function.
 */

export type TokenVisitor = (node: Record<string, unknown>, path: string) => void;

export function walkTokenNodes(
  node: Record<string, unknown>,
  path: string,
  visitor: TokenVisitor
): void {
  if ('$value' in node) {
    visitor(node, path);
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$') || typeof v !== 'object' || v === null) continue;
    walkTokenNodes(v as Record<string, unknown>, path ? `${path}.${k}` : k, visitor);
  }
}
