'use client';

import React from 'react';
import { PromptQualityReport } from '@/lib/types';
import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface QualityChecklistProps {
  report: PromptQualityReport;
}

export const QualityChecklist: React.FC<QualityChecklistProps> = ({ report }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'var(--accent-emerald)';
    if (score >= 75) return 'var(--accent-cyan)';
    if (score >= 60) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Score Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Completeness Score
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.15rem' }}>
            <span
              style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                color: getScoreColor(report.score),
                fontFamily: 'var(--font-mono)',
                lineHeight: 1
              }}
            >
              {report.score}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
        </div>

        <Badge
          variant={report.score >= 80 ? 'emerald' : report.score >= 65 ? 'cyan' : 'rose'}
          size="md"
        >
          Grade: {report.grade}
        </Badge>
      </div>

      {/* Rules inspection list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {report.rules.map((rule) => (
          <div
            key={rule.id}
            style={{
              padding: '0.65rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: rule.passed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
              border: rule.passed
                ? '1px solid rgba(16, 185, 129, 0.15)'
                : '1px solid rgba(244, 63, 94, 0.2)',
              fontSize: '0.8rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {rule.passed ? (
                  <CheckCircle2 size={14} color="var(--accent-emerald)" />
                ) : (
                  <AlertTriangle size={14} color="var(--accent-rose)" />
                )}
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {rule.label}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {rule.passed ? `+${rule.weight}` : `0/${rule.weight}`}
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: 1.4, margin: '0.15rem 0' }}>
              {rule.feedback}
            </p>

            {!rule.passed && (
              <p style={{ color: 'var(--accent-cyan)', fontSize: '0.725rem', marginTop: '0.2rem', fontStyle: 'italic' }}>
                💡 Tip: {rule.tip}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
