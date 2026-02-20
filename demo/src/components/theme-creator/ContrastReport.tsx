import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { oklchToHex, type ValidationIssue } from '@coston/design-tokens/utils';

interface ContrastReportProps {
  lightIssues: ValidationIssue[];
  darkIssues: ValidationIssue[];
}

function IssueList({ issues, mode }: { issues: ValidationIssue[]; mode: 'light' | 'dark' }) {
  const [showPassing, setShowPassing] = useState(false);

  const failing = issues.filter(issue => !issue.passed);
  const passing = issues.filter(issue => issue.passed);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">{mode === 'light' ? 'Light Theme' : 'Dark Theme'}</h4>
        {failing.length === 0 ? (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            All pairs pass
          </Badge>
        ) : (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            {failing.length} issue{failing.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Failing pairs */}
      {failing.length > 0 && (
        <div className="space-y-2">
          {failing.map((issue, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border-2 border-destructive/50 bg-destructive/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium text-sm">{issue.pair}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Contrast: <span className="font-mono">{issue.ratio.toFixed(2)}:1</span>
                    {' · '}
                    Needs <span className="font-mono">4.5:1</span> for WCAG AA
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded border border-border"
                    style={{ backgroundColor: oklchToHex(issue.foreground) }}
                    title="Foreground"
                  />
                  <div
                    className="w-8 h-8 rounded border border-border"
                    style={{ backgroundColor: oklchToHex(issue.background) }}
                    title="Background"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Passing pairs (collapsible) */}
      {passing.length > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPassing(!showPassing)}
            className="w-full justify-between"
          >
            <span className="text-xs text-muted-foreground">
              {passing.length} passing pair{passing.length !== 1 ? 's' : ''}
            </span>
            {showPassing ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showPassing && (
            <div className="space-y-2">
              {passing.map((issue, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{issue.pair}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Contrast: <span className="font-mono">{issue.ratio.toFixed(2)}:1</span>
                        {' · '}
                        <span className="text-green-600">Passes WCAG AA</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded border border-border"
                        style={{ backgroundColor: oklchToHex(issue.foreground) }}
                        title="Foreground"
                      />
                      <div
                        className="w-8 h-8 rounded border border-border"
                        style={{ backgroundColor: oklchToHex(issue.background) }}
                        title="Background"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ContrastReport({ lightIssues, darkIssues }: ContrastReportProps) {
  const lightFailing = lightIssues.filter(issue => !issue.passed).length;
  const darkFailing = darkIssues.filter(issue => !issue.passed).length;
  const totalFailing = lightFailing + darkFailing;
  const totalPairs = lightIssues.length + darkIssues.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contrast Verification</CardTitle>
            <CardDescription>
              Built-in guardrails enforce WCAG AA (4.5:1) during generation
            </CardDescription>
          </div>
          {totalFailing === 0 ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              {totalPairs} Pairs Pass
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="h-4 w-4 mr-1" />
              {totalFailing} Issue{totalFailing !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {totalFailing === 0 && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-green-900 dark:text-green-100">
                  Perfect Accessibility
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                  All {totalPairs} foreground/background pairs meet WCAG AA standards. The theme
                  generator automatically adjusts lightness values to ensure compliance, so contrast
                  violations are prevented at generation time.
                </div>
              </div>
            </div>
          </div>
        )}
        <IssueList issues={lightIssues} mode="light" />
        <div className="border-t border-border" />
        <IssueList issues={darkIssues} mode="dark" />
      </CardContent>
    </Card>
  );
}
