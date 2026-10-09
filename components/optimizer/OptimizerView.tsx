'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
  Terminal,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';
import { evaluatePromptQuality } from '@/lib/prompt-engine/compiler';
import type { PromptEvaluationCriterion } from '@/lib/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

const SAMPLE_WEAK_PROMPT = `Write a login page and connect it to a database. Make it look nice and modern with good colors.`;

const SAMPLE_STRONG_PROMPT = `<system_prompt>
<role>
You are an expert Senior Full-Stack Engineer and Security Specialist.
</role>
<instructions>
Build a robust offline storage handler for Next.js App Router using IndexedDB with schema migration and fallback handling.
</instructions>
<rules>
- NEVER expose database connection credentials in client components.
- Include strict server-side validation using Zod.
- DO NOT use placeholder TODO comments; provide complete drop-in code.
</rules>
<output_format>
Provide the server action and the corresponding TypeScript interface.
</output_format>
</system_prompt>

<user_prompt>
Implement login logic for email {{user_email}} with rate-limiting.
</user_prompt>`;

export const OptimizerView: React.FC = () => {
  const { showToast } = useToast();
  const [promptText, setPromptText] = useState(SAMPLE_WEAK_PROMPT);
  const [copiedImproved, setCopiedImproved] = useState(false);

  const report = useMemo(() => {
    return evaluatePromptQuality(promptText);
  }, [promptText]);

  const handleCopyImproved = () => {
    if (!report.improvedVersion) return;
    navigator.clipboard.writeText(report.improvedVersion);
    setCopiedImproved(true);
    showToast('Auto-improved prompt copied to clipboard!', 'success');
    setTimeout(() => setCopiedImproved(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'var(--accent-emerald)';
    if (score >= 75) return 'var(--accent-cyan)';
    if (score >= 60) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <Badge variant="cyan" size="md" icon={<Wand2 size={13} />} className="mb-2">
          Heuristic Prompt Auditor
        </Badge>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          Prompt Quality & Heuristic Optimizer
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '1rem' }}>
          Evaluate your prompts against 6 production-grade software engineering criteria: role calibration, XML isolation, negative guardrails, and reasoning directives.
        </p>
      </div>

      {/* Editor & Analysis Split Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 1fr)',
          gap: '2rem',
          alignItems: 'start'
        }}
        className="optimizer-split-grid"
      >
        {/* Left: Raw Prompt Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card elevated>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Your Prompt Under Inspection
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPromptText(SAMPLE_WEAK_PROMPT)}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card)'
                  }}
                >
                  Load Weak Example
                </button>
                <button
                  onClick={() => setPromptText(SAMPLE_STRONG_PROMPT)}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    cursor: 'pointer',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card)'
                  }}
                >
                  Load Strong Example
                </button>
              </div>
            </div>

            <textarea
              rows={12}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Paste your prompt here to evaluate its engineering quality..."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                resize: 'vertical',
                lineHeight: 1.5
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Character count: {promptText.length}</span>
              <span>Evaluating live across 6 dimensions</span>
            </div>
          </Card>

          {/* Auto-Improved Version Recommendation */}
          {report.improvedVersion && (
            <Card style={{ border: '1px solid var(--border-accent)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Auto-Improved Gold-Standard Prompt
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="emerald"
                  onClick={handleCopyImproved}
                  icon={copiedImproved ? <Check size={13} /> : <Copy size={13} />}
                >
                  {copiedImproved ? 'Copied!' : 'Copy Improved'}
                </Button>
              </div>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {report.improvedVersion}
              </div>

              <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                <Link href="/studio">
                  <Button size="sm" variant="outline" icon={<Terminal size={13} />}>
                    Open in Studio Workspace
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Right: Heuristic Scorecard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Overall Score Badge */}
          <Card elevated style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ENGINEERING FIDELITY SCORE
            </span>

            <div style={{ margin: '1rem 0' }}>
              <span
                style={{
                  fontSize: '4rem',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: getScoreColor(report.overallScore),
                  lineHeight: 1
                }}
              >
                {report.overallScore}
              </span>
              <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/100</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Badge
                variant={report.overallScore >= 80 ? 'emerald' : report.overallScore >= 65 ? 'cyan' : 'rose'}
                size="md"
              >
                Grade: {report.grade}
              </Badge>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {report.summary}
            </p>
          </Card>

          {/* Criteria Breakdown */}
          <Card>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Criteria Inspection
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {report.criteria.map((c: PromptEvaluationCriterion) => (
                <div
                  key={c.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: c.passed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {c.passed ? (
                        <CheckCircle2 size={15} color="var(--accent-emerald)" />
                      ) : (
                        <AlertTriangle size={15} color="var(--accent-rose)" />
                      )}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {c.name}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: c.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                      }}
                    >
                      {c.score}%
                    </span>
                  </div>

                  <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    {c.feedback}
                  </p>

                  {!c.passed && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontStyle: 'italic' }}>
                      💡 Tip: {c.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
