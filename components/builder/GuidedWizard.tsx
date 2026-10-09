'use client';

import React, { useState } from 'react';
import { StructuredPrompt, PromptSection } from '@/lib/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Layers,
  Code2,
  ShieldCheck,
  Check
} from 'lucide-react';

interface GuidedWizardProps {
  prompt: StructuredPrompt;
  onChange: (updatedPrompt: StructuredPrompt) => void;
  onFinish: () => void;
}

export const GuidedWizard: React.FC<GuidedWizardProps> = ({
  prompt,
  onChange,
  onFinish
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Helper to get or update a section by key
  const getSectionContent = (key: string) => {
    return prompt.sections.find((s) => s.key === key)?.content || '';
  };

  const updateSection = (key: string, content: string, title?: string) => {
    const existingIndex = prompt.sections.findIndex((s) => s.key === key);
    let updatedSections = [...prompt.sections];

    if (existingIndex >= 0) {
      updatedSections[existingIndex] = {
        ...updatedSections[existingIndex],
        content,
        enabled: true
      };
    } else {
      updatedSections.push({
        id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        key,
        title: title || key.toUpperCase().replace(/_/g, ' '),
        content,
        enabled: true,
        order: updatedSections.length
      });
    }

    onChange({
      ...prompt,
      sections: updatedSections,
      isManuallyEdited: false
    });
  };

  const steps = [
    { number: 1, label: 'Task Definition' },
    { number: 2, label: 'Environment & Stack' },
    { number: 3, label: 'Requirements' },
    { number: 4, label: 'Agent Behavior' },
    { number: 5, label: 'Review & Build' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Wizard Progress Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-elevated)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-medium)',
          overflowX: 'auto'
        }}
      >
        {steps.map((s) => {
          const isActive = currentStep === s.number;
          const isDone = currentStep > s.number;
          return (
            <button
              key={s.number}
              onClick={() => setCurrentStep(s.number)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                opacity: isActive || isDone ? 1 : 0.5,
                whiteSpace: 'nowrap'
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: isDone
                    ? 'var(--accent-emerald)'
                    : isActive
                    ? 'var(--accent-cyan)'
                    : 'var(--bg-card)',
                  color: isDone || isActive ? '#090d16' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}
              >
                {isDone ? <Check size={14} /> : s.number}
              </div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: DEFINE THE TASK */}
      {currentStep === 1 && (
        <Card elevated style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <Badge variant="cyan" size="sm">Step 1 of 5</Badge>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Define the Task & Project Identity
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Specify the prompt title, role persona, project context, and high-level objective.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Prompt Title
            </label>
            <input
              type="text"
              value={prompt.title}
              onChange={(e) => onChange({ ...prompt, title: e.target.value })}
              placeholder="e.g. Build Production Auth System in Next.js 15"
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Role and Persona (Who should the AI act as?)
            </label>
            <textarea
              rows={3}
              value={getSectionContent('role')}
              onChange={(e) => updateSection('role', e.target.value, 'ROLE AND EXPERTISE')}
              placeholder="e.g. Act as a Principal Software Architect and Senior Full-Stack Engineer..."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Primary Objective
            </label>
            <textarea
              rows={3}
              value={getSectionContent('objective')}
              onChange={(e) => updateSection('objective', e.target.value, 'OBJECTIVE')}
              placeholder="e.g. Implement a complete user authentication flow with server actions and session validation..."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Project Context & Existing State
            </label>
            <textarea
              rows={3}
              value={getSectionContent('project_context')}
              onChange={(e) => updateSection('project_context', e.target.value, 'PROJECT CONTEXT')}
              placeholder="Describe what the application does, who the users are, and the current codebase state..."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>
        </Card>
      )}

      {/* STEP 2: DEFINE ENVIRONMENT */}
      {currentStep === 2 && (
        <Card elevated style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <Badge variant="cyan" size="sm">Step 2 of 5</Badge>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Define the Environment & Tech Stack
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Bind the AI to strict technologies, versions, frameworks, and architecture patterns.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Technology Stack
            </label>
            <textarea
              rows={5}
              value={getSectionContent('tech_stack')}
              onChange={(e) => updateSection('tech_stack', e.target.value, 'TECHNOLOGY STACK')}
              placeholder="- Framework: Next.js App Router (React 19)&#10;- Language: TypeScript (Strict mode)&#10;- Styling: Modern CSS with custom properties&#10;- Storage: Browser IndexedDB"
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Architecture & System Design Requirements
            </label>
            <textarea
              rows={4}
              value={getSectionContent('architecture_requirements')}
              onChange={(e) => updateSection('architecture_requirements', e.target.value, 'ARCHITECTURE REQUIREMENTS')}
              placeholder="e.g. Modular monolith, separate presentation components from data access, no microservices..."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>
        </Card>
      )}

      {/* STEP 3: DEFINE REQUIREMENTS */}
      {currentStep === 3 && (
        <Card elevated style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <Badge variant="cyan" size="sm">Step 3 of 5</Badge>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Define Requirements & Guardrails
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Specify functional requirements, acceptance criteria, and critical negative constraints.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Functional Requirements (Features to build)
            </label>
            <textarea
              rows={4}
              value={getSectionContent('functional_requirements')}
              onChange={(e) => updateSection('functional_requirements', e.target.value, 'FUNCTIONAL REQUIREMENTS')}
              placeholder="1. Users can create and edit items.&#10;2. Search and filter by category.&#10;3. Export data as JSON."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Negative Constraints & Exclusions (Crucial for AI fidelity)
            </label>
            <textarea
              rows={4}
              value={getSectionContent('constraints_exclusions')}
              onChange={(e) => updateSection('constraints_exclusions', e.target.value, 'CONSTRAINTS AND EXCLUSIONS')}
              placeholder="- DO NOT introduce external API dependencies or mock databases.&#10;- DO NOT leave placeholder TODO comments or truncated functions.&#10;- DO NOT modify unrelated working files."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Acceptance Criteria Checklist
            </label>
            <textarea
              rows={3}
              value={getSectionContent('acceptance_criteria')}
              onChange={(e) => updateSection('acceptance_criteria', e.target.value, 'ACCEPTANCE CRITERIA')}
              placeholder="- [ ] All user workflows succeed.&#10;- [ ] Persistence succeeds across page reloads.&#10;- [ ] Zero TypeScript or lint errors."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>
        </Card>
      )}

      {/* STEP 4: AGENT BEHAVIOR */}
      {currentStep === 4 && (
        <Card elevated style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <Badge variant="cyan" size="sm">Step 4 of 5</Badge>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Define Agent Implementation Behavior
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Instruct the AI on its execution discipline, testing strategy, and final deliverables.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Implementation Workflow Protocol
            </label>
            <textarea
              rows={5}
              value={getSectionContent('implementation_workflow')}
              onChange={(e) => updateSection('implementation_workflow', e.target.value, 'IMPLEMENTATION WORKFLOW')}
              placeholder="1. Inspect existing files before editing.&#10;2. Formulate concise implementation plan.&#10;3. Implement full code without placeholders.&#10;4. Run tests and production build verification."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Testing Strategy & Quality Gates
            </label>
            <textarea
              rows={3}
              value={getSectionContent('testing_strategy')}
              onChange={(e) => updateSection('testing_strategy', e.target.value, 'TESTING STRATEGY')}
              placeholder="Write automated unit tests for state logic. Verify build succeeds with zero TypeScript errors."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Final Directive
            </label>
            <textarea
              rows={3}
              value={getSectionContent('final_instructions')}
              onChange={(e) => updateSection('final_instructions', e.target.value, 'FINAL DIRECTIVE')}
              placeholder="Execute the implementation directly, verify changes with build commands, and report results."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>
        </Card>
      )}

      {/* STEP 5: REVIEW & FINISH */}
      {currentStep === 5 && (
        <Card elevated style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <Badge variant="emerald" size="sm">Step 5 of 5</Badge>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Review Configured Sections
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Your prompt has been populated across structured sections. Ready to view in the workspace!
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem'
            }}
          >
            {prompt.sections.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)',
                  border: s.content.trim() ? '1px solid var(--border-medium)' : '1px dashed var(--border-subtle)',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong style={{ color: s.content.trim() ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {s.title}
                  </strong>
                  <span style={{ color: s.content.trim() ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {s.content.trim() ? '✓' : 'empty'}
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  {s.content.trim() ? `${s.content.split(/\s+/).filter(Boolean).length} words` : 'No content'}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <Button variant="emerald" size="lg" onClick={onFinish} icon={<Sparkles size={16} />}>
              Open in Direct Prompt Workspace
            </Button>
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outline"
          size="md"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          icon={<ArrowLeft size={14} />}
        >
          Previous Step
        </Button>

        {currentStep < 5 ? (
          <Button
            variant="primary"
            size="md"
            onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
            icon={<ArrowRight size={14} />}
          >
            Next Step
          </Button>
        ) : (
          <Button variant="emerald" size="md" onClick={onFinish} icon={<CheckCircle2 size={14} />}>
            Finish Wizard
          </Button>
        )}
      </div>
    </div>
  );
};
