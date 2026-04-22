/**
 * Diff: compare two token states and report changes.
 */

import type { DiffResult, TokenChange } from './types.js';
import type { FlatTokens } from '../build/utils/types.js';
import { isHex, roundedContrast, wcagLevel } from './wcag-utils.js';

export function diffTokens(before: FlatTokens, after: FlatTokens, ref: string): DiffResult {
  const changes: TokenChange[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const old = before[key];
    const cur = after[key];

    if (old === undefined && cur !== undefined) {
      changes.push({ token: key, type: 'added', after: cur });
    } else if (old !== undefined && cur === undefined) {
      changes.push({ token: key, type: 'removed', before: old });
    } else if (old !== cur) {
      const change: TokenChange = {
        token: key,
        type: 'modified',
        before: old,
        after: cur,
      };

      if (isHex(old!) && isHex(cur!) && key.endsWith('-foreground')) {
        const bgKey = key.replace(/-foreground$/, '');
        if (after[bgKey]) {
          const rb = roundedContrast(old!, before[bgKey] ?? old!);
          const ra = roundedContrast(cur!, after[bgKey]);
          change.wcagImpact = {
            ratioBefore: rb,
            ratioAfter: ra,
            levelBefore: wcagLevel(rb),
            levelAfter: wcagLevel(ra),
          };
        }
      }

      changes.push(change);
    }
  }

  return {
    ref,
    changes,
    summary: {
      added: changes.filter(c => c.type === 'added').length,
      removed: changes.filter(c => c.type === 'removed').length,
      modified: changes.filter(c => c.type === 'modified').length,
      wcagRegressions: changes.filter(
        c => c.wcagImpact && c.wcagImpact.ratioAfter < c.wcagImpact.ratioBefore
      ).length,
    },
  };
}
