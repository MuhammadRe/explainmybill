'use client';

// ─────────────────────────────────────────────────────
// AnalysisResult — Full analysis display component
// ─────────────────────────────────────────────────────
// Displays all sections of Claude's analysis:
//   - Summary + risk score
//   - Key figures
//   - Hidden fees
//   - Risks
//   - Important dates
//   - Savings suggestions
//   - Comparison hints

import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Info,
  Lightbulb,
  Shield,
  TrendingDown,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ParsedAnalysis } from '@/types';
import { riskScoreLabel, severityColor, cn } from '@/lib/utils';

interface AnalysisResultProps {
  analysis: ParsedAnalysis;
  documentName: string;
}

export function AnalysisResult({ analysis, documentName }: AnalysisResultProps) {
  const riskInfo = riskScoreLabel(analysis.riskScore);

  return (
    <div className="space-y-6">
      {/* ── Header: Summary + Risk Score ── */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                {analysis.documentType}
              </p>
              <CardTitle className="text-xl">{documentName}</CardTitle>
            </div>
            {/* Risk score badge */}
            <div className="flex flex-col items-end gap-1">
              <div className={cn('text-2xl font-bold', riskInfo.color)}>
                {analysis.riskScore}/10
              </div>
              <Badge
                variant={
                  analysis.riskScore <= 3
                    ? 'success'
                    : analysis.riskScore <= 6
                    ? 'warning'
                    : 'destructive'
                }
              >
                {riskInfo.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{analysis.simpleExplanation}</p>
        </CardContent>
      </Card>

      {/* ── Key Figures ── */}
      {analysis.keyFigures.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <BarChart2 className="h-4 w-4 text-blue-600" />
            Key Figures
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {analysis.keyFigures.map((fig, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-4 text-center"
              >
                <p className="text-xs text-muted-foreground">{fig.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {fig.value}
                  {fig.unit && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {fig.unit}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Hidden Fees ── */}
      {analysis.hiddenFees.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <DollarSign className="h-4 w-4 text-orange-500" />
            Hidden & Unexpected Fees
            <Badge variant="orange" className="text-xs">
              {analysis.hiddenFees.length} found
            </Badge>
          </h2>
          <div className="space-y-3">
            {analysis.hiddenFees.map((fee, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg border p-4',
                  severityColor(fee.severity)
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <p className="font-medium">{fee.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {fee.amount && (
                      <span className="font-semibold">{fee.amount}</span>
                    )}
                    <Badge
                      variant={
                        fee.severity === 'high'
                          ? 'destructive'
                          : fee.severity === 'medium'
                          ? 'orange'
                          : 'warning'
                      }
                      className="capitalize text-xs"
                    >
                      {fee.severity}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm">{fee.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Risks ── */}
      {analysis.risks.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Shield className="h-4 w-4 text-red-500" />
            Risks & Contract Traps
            <Badge variant="destructive" className="text-xs">
              {analysis.risks.length} detected
            </Badge>
          </h2>
          <div className="space-y-3">
            {analysis.risks.map((risk, i) => (
              <div
                key={i}
                className={cn('rounded-lg border p-4', severityColor(risk.severity))}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 shrink-0" />
                    <p className="font-medium">{risk.title}</p>
                  </div>
                  <Badge
                    variant={
                      risk.severity === 'high'
                        ? 'destructive'
                        : risk.severity === 'medium'
                        ? 'orange'
                        : 'warning'
                    }
                    className="capitalize text-xs"
                  >
                    {risk.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-sm">{risk.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Important Dates ── */}
      {analysis.importantDates.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Calendar className="h-4 w-4 text-purple-600" />
            Important Dates
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.importantDates.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-lg border border-purple-200 bg-purple-50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-purple-800">{item.date}</p>
                  <p className="mt-1 text-sm text-purple-700">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Savings Suggestions ── */}
      {analysis.savingsSuggestions.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="h-4 w-4 text-green-600" />
            How to Save Money
          </h2>
          <div className="space-y-3">
            {analysis.savingsSuggestions.map((suggestion, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-lg border border-green-200 bg-green-50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-green-800">{suggestion.title}</p>
                    {suggestion.potentialSaving && (
                      <Badge variant="success" className="text-xs">
                        Save {suggestion.potentialSaving}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-green-700">{suggestion.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Comparison Hints ── */}
      {analysis.comparisonHints.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            How You Compare
          </h2>
          <div className="space-y-3">
            {analysis.comparisonHints.map((hint, i) => (
              <div key={i} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <p className="font-medium text-blue-800">{hint.title}</p>
                </div>
                <p className="text-sm text-blue-700">{hint.description}</p>
                {(hint.userValue || hint.benchmark) && (
                  <div className="mt-3 flex gap-4">
                    {hint.userValue && (
                      <div className="text-center">
                        <p className="text-xs text-blue-600">Your rate</p>
                        <p className="font-bold text-blue-900">{hint.userValue}</p>
                      </div>
                    )}
                    {hint.benchmark && (
                      <div className="text-center">
                        <p className="text-xs text-blue-600">Average</p>
                        <p className="font-semibold text-blue-700">{hint.benchmark}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state when no issues found */}
      {analysis.hiddenFees.length === 0 &&
        analysis.risks.length === 0 &&
        analysis.savingsSuggestions.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
            <Shield className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold text-green-800">
              No major issues detected
            </p>
            <p className="text-sm text-green-600">
              This document looks straightforward with no hidden fees or significant risks.
            </p>
          </div>
        )}
    </div>
  );
}
