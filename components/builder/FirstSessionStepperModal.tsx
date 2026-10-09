'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { StructuredPrompt, PromptSection, OutputFormat, TargetModel } from '@/lib/types';
import { composePrompt } from '@/lib/prompt-engine/composer';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import {
  Sparkles,
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  X,
  Bot,
  Terminal,
  Zap,
  Code2,
  CheckCircle2,
  Cpu,
  Layers,
  Wand2,
  ExternalLink,
  ShieldCheck,
  Boxes
} from 'lucide-react';

interface FirstSessionStepperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (prompt: StructuredPrompt) => void;
}

const NICHE_PRESETS = [
  {
    label: '📄 AI Resume Builder & ATS Scorer',
    theme: 'Build an AI-powered resume builder with real-time markdown preview, ATS scoring, and clean PDF export.',
    constraints: 'Next.js 15 App Router, Tailwind / custom CSS tokens, IndexedDB local storage, sub-100ms latency, zero placeholder comments'
  },
  {
    label: '💼 SaaS Analytics & Billing Dashboard',
    theme: 'Build a multi-tenant SaaS analytics dashboard with team workspace switching, metric graphs, and subscription billing management.',
    constraints: 'Modern modular React components, TypeScript strict mode, responsive mobile layout, zero external mock dependencies'
  },
  {
    label: '🛍️ Modern E-Commerce Storefront',
    theme: 'Build a lightning-fast e-commerce product catalog with instantaneous category filters, cart drawer, and responsive checkout.',
    constraints: 'Accessible WCAG AA contrast, optimistic UI updates, zero layout shifts, clean state management'
  },
  {
    label: '🎨 Developer Portfolio with Dark Mode',
    theme: 'Build a sleek developer portfolio showcase with interactive project cards, contact form, and smooth dark/light mode toggle.',
    constraints: 'Minimal clean aesthetic, 100% responsive on all screen sizes, sub-100ms interaction speed, semantic HTML'
  },
  {
    label: '📋 Collaborative Kanban Task Tool',
    theme: 'Build an offline-first drag-and-drop Kanban task board with custom columns, tag filtering, and JSON backup export.',
    constraints: 'Browser IndexedDB persistence, cross-tab sync, keyboard accessible, robust error boundaries'
  },
  {
    label: '📝 Offline-First Markdown Notes App',
    theme: 'Build a distraction-free markdown notes editor with live split-screen preview, syntax highlighting, and folder hierarchy.',
    constraints: 'Local-first offline storage, instant auto-save, zero telemetry, clean typography with JetBrains Mono'
  }
];

const TARGET_AGENTS = [
  {
    id: 'antigravity',
    name: 'Google Antigravity (AGY)',
    description: 'Premier agentic AI by Google DeepMind. Native skills.sh support, background tasks, subagents & multi-step execution.',
    badge: '⭐ Flagship',
    icon: Sparkles
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'Optimized for Cursor Composer, .cursorrules & multi-file agents',
    badge: 'Popular',
    icon: Terminal
  },
  {
    id: 'claude',
    name: 'Claude Code / Cline',
    description: 'Structured with clean XML delimiters & extended chain-of-thought directives',
    badge: 'High Reasoning',
    icon: Bot
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    description: 'Calibrated for Cascade workflow rules & step-by-step validation',
    badge: 'Fast',
    icon: Zap
  },
  {
    id: 'v0',
    name: 'v0.dev / Bolt',
    description: 'Focused on complete drop-in React 19 UI components with zero placeholders',
    badge: 'Frontend',
    icon: Code2
  },
  {
    id: 'universal',
    name: 'Universal / ChatGPT',
    description: 'Standard markdown format compatible with any LLM or coding agent',
    badge: 'Universal',
    icon: Sparkles
  }
];

const SKILL_PRESETS = [
  {
    id: 'skill-skills-sh',
    name: '⚡ skills.sh Universal Protocol',
    desc: 'Verify and invoke specialized domain skills from skills.sh at each step'
  },
  {
    id: 'skill-ui-ux-pro-max',
    name: '🎨 UI/UX Pro Max Design System',
    desc: 'Consult UI/UX design intelligence: semantic tokens, fluid typography, micro-interactions'
  },
  {
    id: 'skill-vercel-react',
    name: '🚀 Vercel React Best Practices',
    desc: 'RSC by default, minimal client boundaries, zero waterfalls, sub-100ms speed'
  },
  {
    id: 'skill-antigravity-guide',
    name: '🤖 Antigravity Agentic Directives',
    desc: 'Deep subagent decomposition, background execution, and persistent session state'
  },
  {
    id: 'skill-clean-arch',
    name: '🏛️ Clean Architecture & TDD',
    desc: 'Strict separation of domain logic, UI adapters, and automated unit tests'
  },
  {
    id: 'skill-offline-idb',
    name: '💾 Offline-First IndexedDB',
    desc: 'Resilient local-first storage with cross-tab broadcast synchronization'
  }
];

const STACK_PRESETS = [
  'Next.js App Router',
  'React 19',
  'TypeScript Strict',
  'Modern CSS Tokens',
  'Browser IndexedDB',
  'Lucide Icons',
  'Tailwind CSS'
];

export const FirstSessionStepperModal: React.FC<FirstSessionStepperModalProps> = ({
  isOpen,
  onClose,
  onApplyPrompt
}) => {
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nicheTheme, setNicheTheme] = useState(
    'Build an AI-powered developer tool with responsive layout, clean dark mode, and local offline persistence'
  );
  const [nicheConstraints, setNicheConstraints] = useState(
    'Zero data loss across tabs, sub-100ms latency, strict TypeScript, no placeholder comments'
  );
  const [selectedAgent, setSelectedAgent] = useState('antigravity');
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('markdown');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'skill-skills-sh',
    'skill-ui-ux-pro-max',
    'skill-vercel-react',
    'skill-antigravity-guide'
  ]);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([
    'Next.js App Router',
    'React 19',
    'TypeScript Strict',
    'Modern CSS Tokens',
    'Browser IndexedDB'
  ]);
  const [copied, setCopied] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<StructuredPrompt | null>(null);

  // Close and mark first session as done
  const handleDismiss = () => {
    localStorage.setItem('promptforge_first_session_done', 'true');
    onClose();
  };

  const handleSelectPreset = (preset: typeof NICHE_PRESETS[0]) => {
    setNicheTheme(preset.theme);
    setNicheConstraints(preset.constraints);
  };

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack]
    );
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  // Compile the prompt with user niche and boilerplate
  const compileMasterPrompt = (format: OutputFormat = selectedFormat) => {
    const agentObj = TARGET_AGENTS.find((a) => a.id === selectedAgent) || TARGET_AGENTS[0];

    const roleDirective =
      selectedAgent === 'antigravity'
        ? `You are an elite Google Antigravity (AGY) Autonomous Lead Agent and Principal Software Architect powered by Google DeepMind. Execute autonomously across the repository: at EVERY step of development, verify and invoke specialized domain skills from skills.sh (or local .agents/skills/): read SKILL.md before execution, use subagents for complex workflows, execute background test commands, and produce verified, production-grade code without placeholders.`
        : selectedAgent === 'cursor'
        ? `You are an elite Principal Software Architect and Senior Full-Stack Engineer executing in Cursor Composer. Follow strict production-quality coding rules and skills.sh directives: output complete drop-in code without placeholder comments or truncated logic.`
        : selectedAgent === 'claude'
        ? `You are an expert Senior Systems Architect and Staff Engineer executing in Claude Code / Cline. Reason deeply about architectural boundaries, state safety, and type soundness before implementing, strictly adhering to skills.sh protocols.`
        : selectedAgent === 'windsurf'
        ? `You are a Lead Software Architect working in Windsurf Cascade. Execute changes surgically across files, strictly consulting skills.sh domain guides before making changes.`
        : selectedAgent === 'v0'
        ? `You are a World-Class Frontend Engineer and UI/UX Designer. Create stunning, responsive, and fully interactive components with rich micro-animations using UI/UX Pro Max design intelligence.`
        : `You are a Principal Software Architect and Lead AI Engineer. Design and implement a robust, production-ready system with clean architecture and strict typing, adhering to skills.sh protocols.`;

    const title = nicheTheme.trim()
      ? nicheTheme.trim().slice(0, 48) + (nicheTheme.length > 48 ? '...' : '')
      : 'Custom AI Project Prompt';

    const functionalRequirements = `1. Core User Flow: ${nicheTheme.trim()}.\n2. Architecture & Performance: ${nicheConstraints.trim()}.\n3. Real-Time Feedback: Sub-100ms interaction latency with zero cumulative layout shift (CLS).\n4. Data Integrity: Resilient client-side persistence, backup support, and responsive controls across all viewport widths.`;

    const techStackContent = selectedStacks.map((s) => `- ${s}`).join('\n');

    const activeSkillsList = SKILL_PRESETS.filter((s) => selectedSkills.includes(s.id))
      .map((s) => `- ${s.name}: ${s.desc}`)
      .join('\n');

    const skillsDirective = `At EVERY phase and step of development, the AI Agent MUST consult and adhere to specialized Agent Skills (discoverable via skills.sh or local .agents/skills/):\n1. Skill Discovery & Ingestion: Before touching any module, check available skills in .agents/skills/ or install via skills.sh (npx skills add <skill>).\n2. Mandatory Pre-Execution Consultation: Read SKILL.md using file inspection before writing code to apply battle-tested domain patterns.\n3. Active Enforced Skills:\n${activeSkillsList || '- skills.sh Standard Protocol'}\n4. UI/UX Skill Alignment: Adhere to modern design systems (fluid typography, custom CSS tokens, accessible contrast, micro-animations) via ui-ux-pro-max.\n5. Performance Skill Alignment: Adhere to Vercel React Best Practices (RSC by default, zero client waterfalls, bundle optimization).\n6. Strict Rule: Never bypass loaded skill rules or implement generic baseline stubs.`;

    const sections: PromptSection[] = [
      {
        id: 'sec-role',
        key: 'role',
        title: 'ROLE AND EXPERTISE',
        content: roleDirective,
        enabled: true,
        order: 0
      },
      {
        id: 'sec-skills',
        key: 'agent_skills',
        title: 'AGENT SKILLS & EXECUTION PROTOCOL (SKILLS.SH)',
        content: skillsDirective,
        enabled: true,
        order: 1
      },
      {
        id: 'sec-context',
        key: 'project_context',
        title: 'PROJECT CONTEXT',
        content: nicheConstraints.trim().length > 0 ? nicheConstraints.trim() : 'Production web application built for modern engineering workflows.',
        enabled: true,
        order: 2
      },
      {
        id: 'sec-objective',
        key: 'objective',
        title: 'OBJECTIVE',
        content: nicheTheme.trim().length > 0 ? nicheTheme.trim() : 'Build a production-ready, accessible, and responsive application feature from scratch with strict type safety.',
        enabled: true,
        order: 3
      },
      {
        id: 'sec-functional',
        key: 'functional_requirements',
        title: 'FUNCTIONAL REQUIREMENTS',
        content: functionalRequirements,
        enabled: true,
        order: 4
      },
      {
        id: 'sec-tech',
        key: 'tech_stack',
        title: 'TECHNOLOGY STACK',
        content: techStackContent || '- Next.js App Router (TypeScript Strict)\n- React 19 & Modern CSS Tokens',
        enabled: true,
        order: 5
      },
      {
        id: 'sec-arch',
        key: 'architecture_requirements',
        title: 'ARCHITECTURE REQUIREMENTS',
        content: 'Follow clean modular architecture: separate presentation UI from business logic and storage layers. Maintain offline-first reliability and responsive layout across all device widths (320px to 4K).',
        enabled: true,
        order: 6
      },
      {
        id: 'sec-constraints',
        key: 'constraints_exclusions',
        title: 'CONSTRAINTS AND EXCLUSIONS',
        content: '- MANDATORY SKILL USAGE: DO NOT guess architectural patterns or implement ad-hoc styling; you MUST consult and adhere to relevant Agent Skills (from skills.sh or .agents/skills/) at every development step.\n- DO NOT leave lazy placeholder comments, truncated snippets, or "TODO" omissions; provide complete, runnable drop-in code.\n- DO NOT use TypeScript "any" — use strict union types and Zod schemas.\n- DO NOT break existing working components or navigation flows.\n- Ensure 100% WCAG AA contrast compliance and zero hydration errors.',
        enabled: true,
        order: 7
      },
      {
        id: 'sec-workflow',
        key: 'implementation_workflow',
        title: 'IMPLEMENTATION WORKFLOW (SKILLS-DRIVEN)',
        content: 'Phase 1: Skills Discovery & Ingestion — Inspect .agents/skills/ and skills.sh to equip relevant domain skills before starting.\nPhase 2: Modular Architecture Plan — Formulate implementation steps strictly adhering to loaded skill patterns.\nPhase 3: Component & Logic Implementation — Author complete drop-in source code conforming to design systems and performance standards.\nPhase 4: Local Persistence & State — Connect verified storage with zero regressions.\nPhase 5: Automated Verification — Run unit tests and production build verification commands.',
        enabled: true,
        order: 8
      },
      {
        id: 'sec-testing',
        key: 'testing_strategy',
        title: 'TESTING & ACCEPTANCE CRITERIA',
        content: '- [ ] All core user flows execute seamlessly without errors.\n- [ ] UI is 100% responsive across mobile, tablet, and desktop.\n- [ ] Data persists reliably across page reloads and browser sessions.\n- [ ] Production build succeeds cleanly with zero lint or type errors.',
        enabled: true,
        order: 9
      },
      {
        id: 'sec-final',
        key: 'final_instructions',
        title: 'FINAL DIRECTIVE',
        content: 'Execute the implementation directly without unnecessary conversational filler. Consult SKILL.md files where applicable, and provide complete source code ready to run immediately.',
        enabled: true,
        order: 10
      }
    ];

    const targetModelVal: TargetModel = selectedAgent === 'antigravity' ? 'antigravity' : 'universal';

    const newPrompt: StructuredPrompt = {
      id: `prompt-${Date.now()}`,
      title,
      description: nicheTheme.trim(),
      category: 'development',
      targetModel: targetModelVal,
      outputFormat: format,
      sections,
      isFavorite: false,
      isManuallyEdited: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['ai-agent', selectedAgent, 'skills-sh', 'production-ready']
    };

    setGeneratedPrompt(newPrompt);
    return newPrompt;
  };

  const composedPromptText = useMemo(() => {
    if (!generatedPrompt) return '';
    return composePrompt(generatedPrompt.sections, generatedPrompt.outputFormat);
  }, [generatedPrompt]);

  const handleGoToStep2 = () => {
    if (!nicheTheme.trim()) {
      showToast('Please write a brief description of your site', 'info');
      return;
    }
    setStep(2);
  };

  const handleInstantGenerate = () => {
    if (!nicheTheme.trim()) {
      showToast('Please write a brief description of your site', 'info');
      return;
    }
    compileMasterPrompt();
    setStep(3);
  };

  const handleCompileAndGoToStep3 = () => {
    compileMasterPrompt();
    setStep(3);
  };

  const handleCopyPrompt = async () => {
    if (!composedPromptText) return;
    try {
      await navigator.clipboard.writeText(composedPromptText);
      setCopied(true);
      const agentName = TARGET_AGENTS.find((a) => a.id === selectedAgent)?.name || 'AI agent';
      showToast(`Ready to paste into ${agentName}! Copied to clipboard (Cmd/Ctrl + V)`, 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Failed to copy. Please manually copy from the preview box.', 'error');
    }
  };

  const handleOpenInStudio = () => {
    if (generatedPrompt) {
      onApplyPrompt(generatedPrompt);
      localStorage.setItem('promptforge_first_session_done', 'true');
      onClose();
      showToast('Prompt loaded into Studio workspace!', 'success');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quick-stepper-overlay" onClick={handleDismiss}>
      <div className="quick-stepper-modal" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Instant Prompt Generator
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(56, 189, 248, 0.12)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 600
                  }}
                >
                  Step {step} of 3
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Synthesize your niche into a skills.sh-driven AI agent prompt
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
            title="Close stepper"
          >
            <X size={16} />
          </button>
        </div>

        {/* STEPPER PROGRESS BAR */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0.5rem 1.5rem',
            gap: '1rem',
            overflowX: 'auto'
          }}
        >
          {[
            { num: 1, title: '1. Define Site Niche' },
            { num: 2, title: '2. Agent & Skills (skills.sh)' },
            { num: 3, title: '3. Ready to Paste' }
          ].map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num === 1) setStep(1);
                  if (s.num === 2 && nicheTheme.trim()) setStep(2);
                  if (s.num === 3 && generatedPrompt) setStep(3);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive
                    ? 'var(--accent-cyan)'
                    : isDone
                    ? 'var(--accent-emerald)'
                    : 'var(--text-muted)',
                  cursor: s.num <= step ? 'pointer' : 'default',
                  whiteSpace: 'nowrap'
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isDone
                      ? 'var(--accent-emerald)'
                      : isActive
                      ? 'var(--accent-cyan)'
                      : 'var(--bg-elevated)',
                    color: isDone || isActive ? '#090d16' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}
                >
                  {isDone ? <Check size={11} /> : s.num}
                </div>
                <span>{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {/* STEP 1: DEFINE NICHE */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  What kind of site do you want to build?
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Write your project niche in 1 or 2 lines. We will automatically inject it into our skills.sh-aligned prompt boilerplate to produce a complete prompt for your AI agent.
                </p>
              </div>

              {/* Main Niche Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  1. Project Niche & Core Concept (1–2 lines):
                </label>
                <textarea
                  rows={2}
                  value={nicheTheme}
                  onChange={(e) => setNicheTheme(e.target.value)}
                  placeholder="e.g. Build an AI-powered resume builder with real-time markdown preview, ATS scoring, and PDF export"
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Quick Inspiration Pills */}
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Or click an instant blueprint to start:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {NICHE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      className="selectable-chip"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem' }}
                    >
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Details Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  2. Key Quality Requirements & Architectural Focus (Optional):
                </label>
                <textarea
                  rows={2}
                  value={nicheConstraints}
                  onChange={(e) => setNicheConstraints(e.target.value)}
                  placeholder="e.g. Next.js 15, strict TypeScript, 100% responsive, sub-100ms latency, zero placeholder comments"
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: SELECT AGENT & SKILLS */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Select AI Agent & Enforce skills.sh Protocols
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  The prompt will be calibrated with optimal directives and skills.sh protocols suited for Antigravity, Cursor, Claude Code, or your target agent.
                </p>
              </div>

              {/* Target Coding Agents Grid */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Target AI Coding Agent:
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.65rem'
                  }}
                >
                  {TARGET_AGENTS.map((agent) => {
                    const isSelected = selectedAgent === agent.id;
                    const Icon = agent.icon;
                    return (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent.id)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-elevated)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                            <Icon size={14} />
                            <span>{agent.name}</span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '0.1rem 0.35rem',
                              borderRadius: 'var(--radius-sm)',
                              background: agent.id === 'antigravity' ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-card)',
                              color: agent.id === 'antigravity' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                              fontWeight: agent.id === 'antigravity' ? 700 : 500
                            }}
                          >
                            {agent.badge}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                          {agent.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Agent Skills (skills.sh) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Agent Skills to Enforce in Every Step (skills.sh):
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    Mandatory Skills-Driven Development
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.45rem' }}>
                  {SKILL_PRESETS.map((sk) => {
                    const isSelected = selectedSkills.includes(sk.id);
                    return (
                      <div
                        key={sk.id}
                        onClick={() => toggleSkill(sk.id)}
                        className={`selectable-chip ${isSelected ? 'active' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.65rem' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {isSelected && <Check size={12} color="var(--accent-cyan)" />}
                          <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 500 }}>{sk.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tech Stack Chips */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Technologies to Enforce:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {STACK_PRESETS.map((stack) => {
                    const isSelected = selectedStacks.includes(stack);
                    return (
                      <button
                        key={stack}
                        onClick={() => toggleStack(stack)}
                        className={`selectable-chip ${isSelected ? 'active' : ''}`}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{stack}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Output Format */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Formatting Structure:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedFormat('markdown')}
                    className={`selectable-chip ${selectedFormat === 'markdown' ? 'active' : ''}`}
                  >
                    Markdown (## Headings)
                  </button>
                  <button
                    onClick={() => setSelectedFormat('xml')}
                    className={`selectable-chip ${selectedFormat === 'xml' ? 'active' : ''}`}
                  >
                    XML Tags (&lt;section&gt;)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: READY TO PASTE */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Your AI Prompt is Ready!
                    </h2>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--accent-emerald)',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      100/100 Grade A+ · Skills-Driven
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Copy this prompt and paste directly into {TARGET_AGENTS.find((a) => a.id === selectedAgent)?.name || 'your AI tool'}.
                  </p>
                </div>

                <Button
                  variant={copied ? 'emerald' : 'primary'}
                  size="md"
                  onClick={handleCopyPrompt}
                  icon={copied ? <Check size={15} /> : <Copy size={15} />}
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Prompt (Cmd+V)'}
                </Button>
              </div>

              {/* Ready to Paste Preview Box */}
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  maxHeight: '380px',
                  overflowY: 'auto'
                }}
              >
                <pre
                  style={{
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6
                  }}
                >
                  {composedPromptText}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          {/* Left Buttons */}
          <div>
            {step === 1 && (
              <button
                onClick={handleDismiss}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Skip to Studio
              </button>
            )}

            {step === 2 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} icon={<ArrowLeft size={13} />}>
                Back
              </Button>
            )}

            {step === 3 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} icon={<ArrowLeft size={13} />}>
                Create Another
              </Button>
            )}
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {step === 1 && (
              <>
                <Button variant="outline" size="sm" onClick={handleInstantGenerate} icon={<Zap size={13} />}>
                  Fast Track (Instant)
                </Button>
                <Button variant="primary" size="sm" onClick={handleGoToStep2} icon={<ArrowRight size={13} />}>
                  Next: Agent & Skills →
                </Button>
              </>
            )}

            {step === 2 && (
              <Button variant="primary" size="sm" onClick={handleCompileAndGoToStep3} icon={<Wand2 size={13} />}>
                Compile Master Prompt →
              </Button>
            )}

            {step === 3 && (
              <>
                <Button variant="outline" size="sm" onClick={handleOpenInStudio} icon={<ExternalLink size={13} />}>
                  Open in Studio
                </Button>
                <Button
                  variant={copied ? 'emerald' : 'primary'}
                  size="sm"
                  onClick={handleCopyPrompt}
                  icon={copied ? <Check size={13} /> : <Copy size={13} />}
                >
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
