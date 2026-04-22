/**
 * CLI-specific type definitions
 */

import type { FlatTokens } from '../build/utils/types.js';

export interface LintIssue {
  rule: string;
  severity: 'error' | 'warning';
  token: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface LintResult {
  passed: boolean;
  errors: LintIssue[];
  warnings: LintIssue[];
  summary: { errors: number; warnings: number };
}

export interface TokenChange {
  token: string;
  type: 'added' | 'removed' | 'modified';
  field: 'value' | 'description' | 'extensions';
  before?: string;
  after?: string;
  wcagImpact?: {
    ratioBefore: number;
    ratioAfter: number;
    levelBefore: string;
    levelAfter: string;
  };
}

export interface DiffResult {
  ref: string;
  changes: TokenChange[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    wcagRegressions: number;
  };
}

export interface FixChange {
  file: string;
  token: string;
  field: string;
  before?: unknown;
  after?: unknown;
}

export interface FixResult {
  stale: boolean;
  changes: FixChange[];
}

export interface LoadedTokens {
  flat: FlatTokens;
  resolved: FlatTokens;
  rawFiles: Map<string, Record<string, unknown>>;
  coreTokens: FlatTokens;
  semanticTokens: FlatTokens;
}

export interface Config {
  tokenPaths?: string[];
  lint?: {
    orphanAllowlist?: string[];
    contrastMinimum?: number;
    contrastLargeTextMinimum?: number;
    ignorePaths?: string[];
  };
}
