/**
 * Output formatters for human-readable and JSON output.
 */

import type { LintResult, DiffResult, FixResult } from './types.js';

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

export function formatLintResult(result: LintResult, json: boolean): string {
  if (json) return JSON.stringify(result, null, 2);
  const lines: string[] = [];

  if (result.errors.length > 0) {
    lines.push(`${RED}${BOLD}Errors (${result.errors.length})${RESET}`);
    for (const i of result.errors)
      lines.push(`  ${RED}error${RESET} ${DIM}[${i.rule}]${RESET} ${i.token}: ${i.message}`);
    lines.push('');
  }
  if (result.warnings.length > 0) {
    lines.push(`${YELLOW}${BOLD}Warnings (${result.warnings.length})${RESET}`);
    for (const i of result.warnings)
      lines.push(`  ${YELLOW}warn${RESET}  ${DIM}[${i.rule}]${RESET} ${i.token}: ${i.message}`);
    lines.push('');
  }
  if (result.passed && result.warnings.length === 0) {
    lines.push(`${GREEN}All checks passed${RESET}`);
  } else {
    const p: string[] = [];
    if (result.summary.errors > 0)
      p.push(
        `${RED}${result.summary.errors} error${result.summary.errors === 1 ? '' : 's'}${RESET}`
      );
    if (result.summary.warnings > 0)
      p.push(
        `${YELLOW}${result.summary.warnings} warning${result.summary.warnings === 1 ? '' : 's'}${RESET}`
      );
    lines.push(p.join(', '));
  }
  return lines.join('\n');
}

export function formatDiffResult(result: DiffResult, json: boolean): string {
  if (json) return JSON.stringify(result, null, 2);
  const lines: string[] = [`${BOLD}Diff against ${result.ref}${RESET}`, ''];

  for (const c of result.changes) {
    const pfx = c.type === 'added' ? `${GREEN}+` : c.type === 'removed' ? `${RED}-` : `${CYAN}~`;
    let line = `  ${pfx}${RESET} ${c.token}`;
    if (c.type === 'modified') line += ` ${DIM}${c.before} -> ${c.after}${RESET}`;
    else if (c.type === 'added') line += ` ${DIM}${c.after}${RESET}`;
    else line += ` ${DIM}${c.before}${RESET}`;
    if (c.wcagImpact) {
      const clr = c.wcagImpact.ratioAfter < c.wcagImpact.ratioBefore ? RED : GREEN;
      line += ` ${clr}[WCAG: ${c.wcagImpact.ratioBefore}:1 -> ${c.wcagImpact.ratioAfter}:1]${RESET}`;
    }
    lines.push(line);
  }

  lines.push('');
  const { added, removed, modified, wcagRegressions } = result.summary;
  const p: string[] = [];
  if (added > 0) p.push(`${GREEN}${added} added${RESET}`);
  if (removed > 0) p.push(`${RED}${removed} removed${RESET}`);
  if (modified > 0) p.push(`${CYAN}${modified} modified${RESET}`);
  if (wcagRegressions > 0)
    p.push(`${RED}${wcagRegressions} WCAG regression${wcagRegressions === 1 ? '' : 's'}${RESET}`);
  lines.push(p.length > 0 ? p.join(', ') : 'No changes');
  return lines.join('\n');
}

export function formatFixResult(result: FixResult, json: boolean): string {
  if (json) return JSON.stringify(result, null, 2);
  if (result.changes.length === 0) return `${GREEN}Everything up to date${RESET}`;
  const lines = [
    `${BOLD}${result.changes.length} change${result.changes.length === 1 ? '' : 's'}${RESET}`,
  ];
  for (const c of result.changes) lines.push(`  ${CYAN}~${RESET} ${c.token} [${c.field}]`);
  return lines.join('\n');
}
