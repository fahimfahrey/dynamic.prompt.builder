import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Layers,
  Terminal,
  Shield,
  FileCode,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'AI Prompt Engineering & Meta-Prompting Guide',
  description:
    'Comprehensive reference on structuring high-fidelity prompts for AI coding agents, software architects, and production engineering workflows.',
  canonicalPath: '/guide'
});

export default function GuidePage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <Badge variant="cyan" size="md" icon={<BookOpen size={13} />}>
          Engineering Reference Manual
        </Badge>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginTop: '0.75rem',
            marginBottom: '1rem',
            lineHeight: 1.2
          }}
        >
          Meta-Prompting Architecture for AI Coding Agents
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '780px', margin: '0 auto', lineHeight: 1.6 }}>
          How to write deterministic, high-fidelity prompts that force frontier models (Claude 3.7 Sonnet, GPT-4.5, Gemini 2.0 Pro) to produce production-grade software without lazy shortcuts.
        </p>
      </div>

      {/* Section 1: The Core Principles */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          1. The 5 Pillars of High-Fidelity Prompting
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            {
              title: '1. Role Anchoring & Calibration',
              desc: 'Calibrate the model to senior engineering authority (e.g. Principal Architect). This calibrates tone, prevents apologetic filler, and enforces high standards.'
            },
            {
              title: '2. Structural Delimiters',
              desc: 'Use distinct Markdown headings (## ROLE, ## OBJECTIVE) or XML tags (<instructions>, <context>) to completely isolate user input from instructions.'
            },
            {
              title: '3. Explicit Negative Constraints',
              desc: 'Models respond strongly to negative boundaries: "DO NOT use TODO comments", "NEVER introduce external API dependencies", "DO NOT modify unrelated files".'
            },
            {
              title: '4. Phased Implementation Protocol',
              desc: 'Force the agent into a disciplined workflow: Inspect codebase → Create plan → Implement complete drop-in files → Run verification tests.'
            },
            {
              title: '5. Measurable Definition of Done',
              desc: 'Provide an acceptance checklist and test execution commands so the agent can independently verify its own completion.'
            }
          ].map((pillar, idx) => (
            <Card key={idx} elevated style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
                {pillar.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {pillar.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 2: Markdown vs XML Structuring */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          2. Formatting Strategies: Markdown vs XML
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <Card elevated style={{ padding: '1.5rem' }}>
            <Badge variant="cyan" size="sm" className="mb-2">Recommended for General LLMs & IDEs</Badge>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0' }}>
              Markdown Structured Headings
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Universal compatibility across ChatGPT, Cursor, Windsurf, and Claude Code. Clean visual readability for humans.
            </p>
            <pre
              style={{
                background: '#040711',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                fontSize: '0.75rem',
                color: '#93c5fd',
                fontFamily: 'var(--font-mono)',
                overflowX: 'auto'
              }}
            >
{`## ROLE AND EXPERTISE
Act as a Principal Next.js Engineer.

## OBJECTIVE
Implement auth handler with strict types.

## CONSTRAINTS AND EXCLUSIONS
- DO NOT use placeholder comments.
- NO external API dependencies.`}
            </pre>
          </Card>

          <Card elevated style={{ padding: '1.5rem' }}>
            <Badge variant="emerald" size="sm" className="mb-2">Recommended for Claude 3.7 & DeepSeek R1</Badge>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0' }}>
              XML Tag Isolation
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Anthropic models are pre-trained on XML tags. It completely eliminates prompt injection and context leakage.
            </p>
            <pre
              style={{
                background: '#040711',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                fontSize: '0.75rem',
                color: '#93c5fd',
                fontFamily: 'var(--font-mono)',
                overflowX: 'auto'
              }}
            >
{`<role>
Act as a Principal Next.js Engineer.
</role>

<instructions>
Implement auth handler with strict types.
</instructions>

<rules>
- DO NOT use placeholder comments.
</rules>`}
            </pre>
          </Card>
        </div>
      </section>

      {/* Section 3: Call to Action */}
      <div
        style={{
          textAlign: 'center',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.18) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)'
        }}
      >
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Ready to build your prompt?
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
          Open the PromptForge Studio to construct modular, battle-tested prompts with live quality auditing.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/">
            <Button variant="emerald" size="lg" icon={<Terminal size={16} />}>
              Open Prompt Builder Workspace
            </Button>
          </Link>
          <Link href="/templates">
            <Button variant="outline" size="lg" icon={<Layers size={16} />}>
              Explore Blueprints
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
