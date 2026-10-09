'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StructuredPrompt,
  PromptSection,
  PromptStats,
  PromptQualityReport
} from '@/lib/types';
import {
  SELECTABLE_ROLE_PRESETS,
  SELECTABLE_TECH_STACK_CHIPS,
  SELECTABLE_GUARDRAIL_CHIPS,
  SELECTABLE_WORKFLOW_PRESETS,
  SELECTABLE_TESTING_CHIPS,
  SELECTABLE_ARCHITECTURE_CHIPS,
  SELECTABLE_SKILL_CHIPS,
  BUILT_IN_TEMPLATES,
  SelectableBoilerplateOption
} from '@/lib/data/default-templates';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Save,
  Download,
  Terminal,
  Layers,
  Shield,
  Cpu,
  Workflow,
  Wand2,
  FileCode,
  RotateCcw,
  Zap,
  CheckCheck
} from 'lucide-react';

interface DynamicSelectableBuilderProps {
  prompt: StructuredPrompt;
  onChange: (updatedPrompt: StructuredPrompt) => void;
  onSave: () => void;
  onCopy: () => void;
  copied: boolean;
  isSaving: boolean;
  stats: PromptStats;
  qualityReport: PromptQualityReport;
  composedText: string;
}

export const DynamicSelectableBuilder: React.FC<DynamicSelectableBuilderProps> = ({
  prompt,
  onChange,
  onSave,
  onCopy,
  copied,
  isSaving,
  stats,
  qualityReport,
  composedText
}) => {
  // Extract initial 2-line theme from objective or defaults
  const initialThemeLine1 = useMemo(() => {
    const objSec = prompt.sections.find((s) => s.key === 'objective');
    return objSec?.content || 'Build an offline-first developer tool with responsive layout and local persistence';
  }, [prompt.sections]);

  const initialThemeLine2 = useMemo(() => {
    const ctxSec = prompt.sections.find((s) => s.key === 'project_context');
    return ctxSec?.content || 'Zero hydration mismatches, sub-100ms interaction latency, and 100% responsiveness';
  }, [prompt.sections]);

  const [themeLine1, setThemeLine1] = useState(initialThemeLine1);
  const [themeLine2, setThemeLine2] = useState(initialThemeLine2);

  // Selected Boilerplate State
  const [selectedRole, setSelectedRole] = useState<string>(() => {
    const roleSec = prompt.sections.find((s) => s.key === 'role');
    const matched = SELECTABLE_ROLE_PRESETS.find((r) => roleSec?.content.includes(r.label));
    return matched ? matched.id : 'role-antigravity';
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    const skillSec = prompt.sections.find((s) => s.key === 'agent_skills');
    const defaults = ['skill-skills-sh', 'skill-ui-ux-pro-max', 'skill-vercel-react', 'skill-antigravity'];
    if (!skillSec) return defaults;
    const matches = SELECTABLE_SKILL_CHIPS.filter((sk) => skillSec.content.includes(sk.label.split(' ')[1] || '')).map((sk) => sk.id);
    return matches.length > 0 ? matches : defaults;
  });

  const [selectedStacks, setSelectedStacks] = useState<string[]>(() => {
    const techSec = prompt.sections.find((s) => s.key === 'tech_stack');
    const defaults = ['stack-nextjs', 'stack-react19', 'stack-typescript', 'stack-css-tokens', 'stack-idb', 'stack-lucide'];
    if (!techSec) return defaults;
    const matches = SELECTABLE_TECH_STACK_CHIPS.filter((s) => techSec.content.includes(s.label)).map((s) => s.id);
    return matches.length > 0 ? matches : defaults;
  });

  const [selectedGuardrails, setSelectedGuardrails] = useState<string[]>(() => {
    const guardSec = prompt.sections.find((s) => s.key === 'constraints_exclusions');
    const defaults = ['guard-skills-enforced', 'guard-no-todos', 'guard-no-any', 'guard-no-backend', 'guard-no-generic-ui', 'guard-no-break-nav', 'guard-no-unhandled-errors'];
    if (!guardSec) return defaults;
    const matches = SELECTABLE_GUARDRAIL_CHIPS.filter((g) => guardSec.content.includes(g.label.replace('❌ ', ''))).map((g) => g.id);
    return matches.length > 0 ? matches : defaults;
  });

  const [selectedWorkflow, setSelectedWorkflow] = useState<string>(() => {
    const wfSec = prompt.sections.find((s) => s.key === 'implementation_workflow');
    if (wfSec?.content.includes('TDD') || wfSec?.content.includes('Test-Driven')) return 'wf-tdd';
    if (wfSec?.content.includes('Hypothesis') || wfSec?.content.includes('Surgical')) return 'wf-surgical';
    if (wfSec?.content.includes('Refurbish')) return 'wf-refurbish';
    return 'wf-phased';
  });

  const [selectedTesting, setSelectedTesting] = useState<string[]>(() => {
    return ['test-ts', 'test-responsive', 'test-unit', 'test-offline', 'test-a11y', 'test-build'];
  });

  const [selectedArchitecture, setSelectedArchitecture] = useState<string[]>(() => {
    return ['arch-modular', 'arch-offline', 'arch-rsc', 'arch-performance'];
  });

  // Dynamically compile sections whenever theme or selections change
  const syncDynamicSections = useCallback(
    (
      line1: string,
      line2: string,
      roleId: string,
      skillIds: string[],
      stackIds: string[],
      guardrailIds: string[],
      workflowId: string,
      testingIds: string[],
      archIds: string[]
    ) => {
      const roleItem = SELECTABLE_ROLE_PRESETS.find((r) => r.id === roleId) || SELECTABLE_ROLE_PRESETS[0];
      const workflowItem = SELECTABLE_WORKFLOW_PRESETS.find((w) => w.id === workflowId) || SELECTABLE_WORKFLOW_PRESETS[0];

      const skillsContent = SELECTABLE_SKILL_CHIPS.filter((sk) => skillIds.includes(sk.id))
        .map((sk) => sk.snippet)
        .join('\n');

      const techStackContent = SELECTABLE_TECH_STACK_CHIPS.filter((s) => stackIds.includes(s.id))
        .map((s) => s.snippet)
        .join('\n');

      const guardrailsContent = SELECTABLE_GUARDRAIL_CHIPS.filter((g) => guardrailIds.includes(g.id))
        .map((g) => g.snippet)
        .join('\n');

      const testingContent = SELECTABLE_TESTING_CHIPS.filter((t) => testingIds.includes(t.id))
        .map((t) => t.snippet)
        .join('\n');

      const archContent = SELECTABLE_ARCHITECTURE_CHIPS.filter((a) => archIds.includes(a.id))
        .map((a) => `- ${a.snippet}`)
        .join('\n');

      const functionalContent = `1. Implement primary user workflow: ${line1.trim()}.\n2. Handle core constraints: ${line2.trim()}.\n3. Provide immediate UI feedback, instant updates, and zero layout shift.\n4. Support data backup, export, and responsive controls across all screen sizes.`;

      const acceptanceContent = testingContent.length > 0 ? testingContent : '- [ ] All workflows verified and production build passes cleanly.';

      const deliverablesContent = '1. Complete source code files with zero placeholder omissions.\n2. Automated unit tests verifying business logic and state.\n3. Summary of architecture decisions, verification commands, and operational steps.';

      const finalInstructionsContent = `Execute the implementation directly, run the test suites and production build, and confirm all user flows work smoothly across all screen widths. Consult SKILL.md before execution.`;

      // Build updated sections
      const updatedSections: PromptSection[] = [
        {
          id: 'sec-role',
          key: 'role',
          title: 'ROLE AND EXPERTISE',
          content: roleItem.snippet,
          enabled: true,
          order: 0
        },
        {
          id: 'sec-skills',
          key: 'agent_skills',
          title: 'AGENT SKILLS & EXECUTION PROTOCOL (SKILLS.SH)',
          content:
            skillsContent ||
            '- skills.sh Universal Protocol: At every step of development, verify and invoke specialized domain skills from skills.sh (or local .agents/skills/) before authoring or modifying code.',
          enabled: true,
          order: 1
        },
        {
          id: 'sec-context',
          key: 'project_context',
          title: 'PROJECT CONTEXT',
          content: line2.trim().length > 0 ? line2.trim() : 'Production web application built for developers and engineering teams.',
          enabled: true,
          order: 2
        },
        {
          id: 'sec-objective',
          key: 'objective',
          title: 'OBJECTIVE',
          content: line1.trim().length > 0 ? line1.trim() : 'Build a production-ready, accessible, and responsive feature with strict type safety.',
          enabled: true,
          order: 3
        },
        {
          id: 'sec-functional',
          key: 'functional_requirements',
          title: 'FUNCTIONAL REQUIREMENTS',
          content: functionalContent,
          enabled: true,
          order: 4
        },
        {
          id: 'sec-tech',
          key: 'tech_stack',
          title: 'TECHNOLOGY STACK',
          content: techStackContent || '- Next.js App Router (TypeScript Strict)\n- React 19 & Vanilla CSS custom tokens',
          enabled: true,
          order: 5
        },
        {
          id: 'sec-arch',
          key: 'architecture_requirements',
          title: 'ARCHITECTURE REQUIREMENTS',
          content: archContent || 'Follow clean modular architecture: separate presentation UI from business logic and storage layers.',
          enabled: true,
          order: 6
        },
        {
          id: 'sec-constraints',
          key: 'constraints_exclusions',
          title: 'CONSTRAINTS AND EXCLUSIONS',
          content: guardrailsContent || '- MANDATORY SKILL USAGE: Consult and adhere to relevant Agent Skills (from skills.sh or .agents/skills/) at every development step.\n- DO NOT use lazy placeholder comments or truncated "TODO" implementations.\n- DO NOT use TypeScript "any".',
          enabled: true,
          order: 7
        },
        {
          id: 'sec-workflow',
          key: 'implementation_workflow',
          title: 'IMPLEMENTATION WORKFLOW (SKILLS-DRIVEN)',
          content: workflowItem.snippet,
          enabled: true,
          order: 8
        },
        {
          id: 'sec-testing',
          key: 'testing_strategy',
          title: 'TESTING STRATEGY',
          content: 'Write automated unit tests for business logic and state transformations. Verify build succeeds with zero TypeScript or lint errors.',
          enabled: true,
          order: 9
        },
        {
          id: 'sec-acceptance',
          key: 'acceptance_criteria',
          title: 'ACCEPTANCE CRITERIA',
          content: acceptanceContent,
          enabled: true,
          order: 10
        },
        {
          id: 'sec-deliverables',
          key: 'deliverables',
          title: 'DELIVERABLES',
          content: deliverablesContent,
          enabled: true,
          order: 11
        },
        {
          id: 'sec-final',
          key: 'final_instructions',
          title: 'FINAL DIRECTIVE',
          content: finalInstructionsContent,
          enabled: true,
          order: 12
        }
      ];

      onChange({
        ...prompt,
        sections: updatedSections,
        isManuallyEdited: false,
        rawPromptOverride: undefined
      });
    },
    [prompt, onChange]
  );

  // Apply Blueprint preset
  const handleApplyBlueprint = (templateId: string) => {
    const tmpl = BUILT_IN_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    const obj = tmpl.sections.find((s) => s.key === 'objective')?.content || '';
    const ctx = tmpl.sections.find((s) => s.key === 'project_context')?.content || '';

    setThemeLine1(obj);
    setThemeLine2(ctx);

    if (templateId === 'tmpl-refurbish-existing-app') {
      setSelectedRole('role-architect');
      setSelectedWorkflow('wf-refurbish');
    } else if (templateId === 'tmpl-root-cause-debugger') {
      setSelectedRole('role-sre-debugger');
      setSelectedWorkflow('wf-surgical');
    } else if (templateId === 'tmpl-create-design-system') {
      setSelectedRole('role-frontend-ui');
      setSelectedWorkflow('wf-phased');
    } else if (templateId === 'tmpl-ai-coding-agent-director') {
      setSelectedRole('role-agent-director');
      setSelectedWorkflow('wf-phased');
    } else {
      setSelectedRole('role-architect');
      setSelectedWorkflow('wf-phased');
    }

    syncDynamicSections(
      obj,
      ctx,
      templateId === 'tmpl-root-cause-debugger' ? 'role-sre-debugger' : 'role-architect',
      selectedSkills,
      selectedStacks,
      selectedGuardrails,
      templateId === 'tmpl-root-cause-debugger' ? 'wf-surgical' : 'wf-phased',
      selectedTesting,
      selectedArchitecture
    );
  };

  // Toggle multi-select chips
  const toggleSkill = (id: string) => {
    const updated = selectedSkills.includes(id)
      ? selectedSkills.filter((s) => s !== id)
      : [...selectedSkills, id];
    setSelectedSkills(updated);
    syncDynamicSections(themeLine1, themeLine2, selectedRole, updated, selectedStacks, selectedGuardrails, selectedWorkflow, selectedTesting, selectedArchitecture);
  };

  const toggleStack = (id: string) => {
    const updated = selectedStacks.includes(id)
      ? selectedStacks.filter((s) => s !== id)
      : [...selectedStacks, id];
    setSelectedStacks(updated);
    syncDynamicSections(themeLine1, themeLine2, selectedRole, selectedSkills, updated, selectedGuardrails, selectedWorkflow, selectedTesting, selectedArchitecture);
  };

  const toggleGuardrail = (id: string) => {
    const updated = selectedGuardrails.includes(id)
      ? selectedGuardrails.filter((g) => g !== id)
      : [...selectedGuardrails, id];
    setSelectedGuardrails(updated);
    syncDynamicSections(themeLine1, themeLine2, selectedRole, selectedSkills, selectedStacks, updated, selectedWorkflow, selectedTesting, selectedArchitecture);
  };

  const toggleTesting = (id: string) => {
    const updated = selectedTesting.includes(id)
      ? selectedTesting.filter((t) => t !== id)
      : [...selectedTesting, id];
    setSelectedTesting(updated);
    syncDynamicSections(themeLine1, themeLine2, selectedRole, selectedSkills, selectedStacks, selectedGuardrails, selectedWorkflow, updated, selectedArchitecture);
  };

  const toggleArchitecture = (id: string) => {
    const updated = selectedArchitecture.includes(id)
      ? selectedArchitecture.filter((a) => a !== id)
      : [...selectedArchitecture, id];
    setSelectedArchitecture(updated);
    syncDynamicSections(themeLine1, themeLine2, selectedRole, selectedSkills, selectedStacks, selectedGuardrails, selectedWorkflow, selectedTesting, updated);
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    syncDynamicSections(themeLine1, themeLine2, roleId, selectedSkills, selectedStacks, selectedGuardrails, selectedWorkflow, selectedTesting, selectedArchitecture);
  };

  const handleWorkflowChange = (wfId: string) => {
    setSelectedWorkflow(wfId);
    syncDynamicSections(themeLine1, themeLine2, selectedRole, selectedSkills, selectedStacks, selectedGuardrails, wfId, selectedTesting, selectedArchitecture);
  };

  const handleLine1Change = (val: string) => {
    setThemeLine1(val);
    syncDynamicSections(val, themeLine2, selectedRole, selectedSkills, selectedStacks, selectedGuardrails, selectedWorkflow, selectedTesting, selectedArchitecture);
  };

  const handleLine2Change = (val: string) => {
    setThemeLine2(val);
    syncDynamicSections(themeLine1, val, selectedRole, selectedSkills, selectedStacks, selectedGuardrails, selectedWorkflow, selectedTesting, selectedArchitecture);
  };

  // Download handlers
  const handleDownloadMd = () => {
    const blob = new Blob([composedText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* MINIMAL PRESETS ROW */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          padding: '0.65rem 0.85rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
            marginRight: '0.25rem'
          }}
        >
          Blueprints:
        </span>
        {BUILT_IN_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => handleApplyBlueprint(tmpl.id)}
            className="selectable-chip"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', minHeight: '28px' }}
            title={tmpl.description}
          >
            <Sparkles size={11} color="var(--accent-cyan)" />
            <span>{tmpl.title.replace(' Prompt', '').replace(' Blueprint', '')}</span>
          </button>
        ))}
      </div>

      {/* 2-LINE THEME INPUTS (CLEAN & MINIMAL) */}
      <Card
        style={{
          padding: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          border: '1px solid var(--border-medium)',
          background: 'var(--bg-card)'
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            1. What do you want to build? (Core Theme)
          </label>
          <textarea
            rows={2}
            value={themeLine1}
            onChange={(e) => handleLine1Change(e.target.value)}
            placeholder="e.g. Build an offline-first markdown notes application with real-time sync and responsive design"
            style={{
              width: '100%',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 0.75rem',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              resize: 'vertical'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            2. Constraints, Quality Requirements & Technical Focus:
          </label>
          <textarea
            rows={2}
            value={themeLine2}
            onChange={(e) => handleLine2Change(e.target.value)}
            placeholder="e.g. Zero data loss across tabs, sub-100ms latency, IndexedDB persistence, strict TypeScript, no placeholder comments"
            style={{
              width: '100%',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 0.75rem',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              resize: 'vertical'
            }}
          />
        </div>
      </Card>

      {/* SELECTABLE BOILERPLATE MODULES */}
      <Card
        style={{
          padding: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Role */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Role & Persona
            </span>
          </div>
          <div className="chip-group">
            {SELECTABLE_ROLE_PRESETS.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  className={`selectable-chip ${isSelected ? 'active' : ''}`}
                >
                  {isSelected && <Check size={12} color="var(--accent-cyan)" />}
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Agent Skills & Protocols (skills.sh) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Agent Skills & Protocols (skills.sh) ({selectedSkills.length})
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              ⚡ Enforced at Every Step
            </span>
          </div>
          <div className="chip-group">
            {SELECTABLE_SKILL_CHIPS.map((sk) => {
              const isSelected = selectedSkills.includes(sk.id);
              return (
                <button
                  key={sk.id}
                  onClick={() => toggleSkill(sk.id)}
                  className={`selectable-chip ${isSelected ? 'active' : ''}`}
                >
                  {isSelected && <Check size={12} color="var(--accent-cyan)" />}
                  <span>{sk.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Tech Stack ({selectedStacks.length})
            </span>
          </div>
          <div className="chip-group">
            {SELECTABLE_TECH_STACK_CHIPS.map((s) => {
              const isSelected = selectedStacks.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleStack(s.id)}
                  className={`selectable-chip ${isSelected ? 'active' : ''}`}
                >
                  {isSelected && <Check size={12} color="var(--accent-cyan)" />}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guardrails */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Negative Guardrails ({selectedGuardrails.length})
            </span>
          </div>
          <div className="chip-group">
            {SELECTABLE_GUARDRAIL_CHIPS.map((g) => {
              const isSelected = selectedGuardrails.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => toggleGuardrail(g.id)}
                  className={`selectable-chip ${isSelected ? 'active' : ''}`}
                >
                  {isSelected && <Check size={12} color="var(--accent-cyan)" />}
                  <span>{g.label.replace('❌ ', '')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workflow */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Implementation Workflow
            </span>
          </div>
          <div className="chip-group">
            {SELECTABLE_WORKFLOW_PRESETS.map((w) => {
              const isSelected = selectedWorkflow === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => handleWorkflowChange(w.id)}
                  className={`selectable-chip ${isSelected ? 'active' : ''}`}
                >
                  {isSelected && <Check size={12} color="var(--accent-cyan)" />}
                  <span>{w.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Testing */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Testing & Acceptance ({selectedTesting.length})
            </span>
          </div>
          <div className="chip-group">
            {SELECTABLE_TESTING_CHIPS.map((t) => {
              const isSelected = selectedTesting.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTesting(t.id)}
                  className={`selectable-chip ${isSelected ? 'active' : ''}`}
                >
                  {isSelected && <Check size={12} color="var(--accent-cyan)" />}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Architecture */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Architecture & Persistence ({selectedArchitecture.length})
            </span>
          </div>
          <div className="chip-group">
            {SELECTABLE_ARCHITECTURE_CHIPS.map((a) => {
              const isSelected = selectedArchitecture.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleArchitecture(a.id)}
                  className={`selectable-chip ${isSelected ? 'active' : ''}`}
                >
                  {isSelected && <Check size={12} color="var(--accent-cyan)" />}
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};
