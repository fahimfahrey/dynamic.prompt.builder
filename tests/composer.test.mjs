import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Core deterministic composition function
function composePrompt(sections, format = 'markdown') {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const active = sorted.filter(s => s.enabled && s.content && s.content.trim().length > 0);

  if (active.length === 0) return '';

  if (format === 'xml') {
    return active
      .map(s => {
        const tag = (s.key || s.title).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        return `<${tag}>\n${s.content.trim()}\n</${tag}>`;
      })
      .join('\n\n');
  }

  if (format === 'plain') {
    return active
      .map(s => `--- ${s.title.toUpperCase().trim()} ---\n${s.content.trim()}`)
      .join('\n\n');
  }

  // Markdown
  return active
    .map(s => `## ${s.title.toUpperCase().trim()}\n\n${s.content.trim()}`)
    .join('\n\n');
}

function estimateTokenCount(text) {
  if (!text || text.trim().length === 0) return 0;
  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const charCount = trimmed.length;
  return Math.max(1, Math.ceil((charCount / 3.8 + wordCount * 1.25) / 2));
}

function auditPromptQuality(sections, composedText) {
  const textLower = composedText.toLowerCase();
  const rules = [];

  const objectiveSec = sections.find(s => s.key === 'objective' && s.enabled && s.content.trim());
  const hasObjective = !!objectiveSec || textLower.includes('objective') || textLower.includes('goal');
  rules.push({ id: 'objective', passed: hasObjective, weight: 20 });

  const roleSec = sections.find(s => s.key === 'role' && s.enabled && s.content.trim());
  const hasRole = !!roleSec || textLower.includes('act as') || textLower.includes('you are');
  rules.push({ id: 'role', passed: hasRole, weight: 15 });

  const techSec = sections.find(s => s.key === 'tech_stack' && s.enabled && s.content.trim());
  const hasTech = !!techSec || textLower.includes('stack') || textLower.includes('typescript');
  rules.push({ id: 'tech_stack', passed: hasTech, weight: 15 });

  const constraintsSec = sections.find(s => s.key === 'constraints_exclusions' && s.enabled && s.content.trim());
  const hasConstraints = (!!constraintsSec && constraintsSec.content.length > 15) || textLower.includes('do not') || textLower.includes('never');
  rules.push({ id: 'constraints', passed: hasConstraints, weight: 15 });

  const workflowSec = sections.find(s => s.key === 'implementation_workflow' && s.enabled && s.content.trim());
  const hasWorkflow = !!workflowSec || textLower.includes('workflow') || textLower.includes('step 1');
  rules.push({ id: 'workflow', passed: hasWorkflow, weight: 15 });

  const criteriaSec = sections.find(s => s.key === 'acceptance_criteria' && s.enabled && s.content.trim());
  const hasVerification = !!criteriaSec || textLower.includes('acceptance criteria') || textLower.includes('test');
  rules.push({ id: 'verification', passed: hasVerification, weight: 10 });

  const emptyActive = sections.filter(s => s.enabled && (!s.content || !s.content.trim()));
  rules.push({ id: 'cleanliness', passed: emptyActive.length === 0, weight: 10 });

  let totalScore = 0;
  for (const r of rules) {
    if (r.passed) totalScore += r.weight;
  }

  let grade = 'Incomplete';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 55) grade = 'C';

  return { score: totalScore, grade, rules };
}

describe('Prompt Composer Engine Suite', () => {
  const sampleSections = [
    { id: '1', key: 'role', title: 'ROLE', content: 'Act as a Senior Architect.', enabled: true, order: 0 },
    { id: '2', key: 'objective', title: 'OBJECTIVE', content: 'Build a Prompt Builder.', enabled: true, order: 1 },
    { id: '3', key: 'tech_stack', title: 'TECH STACK', content: 'Next.js App Router, TypeScript', enabled: true, order: 2 },
    { id: '4', key: 'disabled_sec', title: 'UNUSED', content: 'Ignored content', enabled: false, order: 3 },
    { id: '5', key: 'empty_sec', title: 'EMPTY', content: '   ', enabled: true, order: 4 },
    { id: '6', key: 'constraints_exclusions', title: 'CONSTRAINTS', content: 'DO NOT add backend or databases. NEVER use fake APIs.', enabled: true, order: 5 },
    { id: '7', key: 'implementation_workflow', title: 'WORKFLOW', content: '1. Inspect\n2. Plan\n3. Execute\n4. Verify', enabled: true, order: 6 },
    { id: '8', key: 'acceptance_criteria', title: 'ACCEPTANCE CRITERIA', content: '- [ ] All tests pass\n- [ ] Clean build', enabled: true, order: 7 }
  ];

  test('composes markdown output preserving order and omitting disabled/empty sections', () => {
    const result = composePrompt(sampleSections, 'markdown');
    assert.match(result, /^## ROLE\n\nAct as a Senior Architect\./);
    assert.match(result, /## OBJECTIVE/);
    assert.match(result, /## TECH STACK/);
    assert.doesNotMatch(result, /## UNUSED/);
    assert.doesNotMatch(result, /## EMPTY/);
  });

  test('composes XML formatted output with sanitized tags', () => {
    const result = composePrompt(sampleSections, 'xml');
    assert.match(result, /<role>\nAct as a Senior Architect\.\n<\/role>/);
    assert.match(result, /<objective>\nBuild a Prompt Builder\.\n<\/objective>/);
    assert.doesNotMatch(result, /<unused>/);
  });

  test('composes plain text formatted output', () => {
    const result = composePrompt(sampleSections, 'plain');
    assert.match(result, /--- ROLE ---\nAct as a Senior Architect\./);
    assert.match(result, /--- OBJECTIVE ---/);
  });

  test('calculates token heuristics realistically', () => {
    const text = 'Act as a senior software architect with production Next.js experience.';
    const tokens = estimateTokenCount(text);
    assert.ok(tokens >= 10 && tokens <= 25, `Expected tokens between 10 and 25, got ${tokens}`);
  });

  test('audits prompt completeness and awards grade A+ to comprehensive prompt', () => {
    const composed = composePrompt(sampleSections, 'markdown');
    const audit = auditPromptQuality(sampleSections, composed);
    assert.ok(audit.score >= 90, `Expected score >= 90, got ${audit.score}`);
    assert.equal(audit.grade, 'A+');
    assert.equal(audit.rules.find(r => r.id === 'objective').passed, true);
    assert.equal(audit.rules.find(r => r.id === 'role').passed, true);
    assert.equal(audit.rules.find(r => r.id === 'constraints').passed, true);
  });

  test('flags incomplete prompts missing objective and constraints', () => {
    const incompleteSections = [
      { id: '1', key: 'random', title: 'NOTE', content: 'Do something', enabled: true, order: 0 }
    ];
    const composed = composePrompt(incompleteSections, 'markdown');
    const audit = auditPromptQuality(incompleteSections, composed);
    assert.ok(audit.score < 50, `Expected score < 50, got ${audit.score}`);
    assert.equal(audit.grade, 'Incomplete');
    assert.equal(audit.rules.find(r => r.id === 'objective').passed, false);
    assert.equal(audit.rules.find(r => r.id === 'constraints').passed, false);
  });

  test('all enriched production templates achieve 99+ completeness score', () => {
    const templates = [
      {
        id: 'tmpl-refurbish',
        sections: [
          { key: 'role', content: 'Act as a principal software architect and systems engineer.', enabled: true },
          { key: 'objective', content: 'Refurbish codebase into production developer tool.', enabled: true },
          { key: 'tech_stack', content: '- Next.js App Router (TypeScript)\n- React 19', enabled: true },
          { key: 'constraints_exclusions', content: '- DO NOT build backend.\n- DO NOT leave placeholder TODO comments.', enabled: true },
          { key: 'implementation_workflow', content: '1. Inspect\n2. Plan\n3. Execute\n4. Verify', enabled: true },
          { key: 'acceptance_criteria', content: '- [ ] Production build succeeds cleanly.', enabled: true }
        ]
      },
      {
        id: 'tmpl-greenfield',
        sections: [
          { key: 'role', content: 'Act as a senior full-stack engineer and architect.', enabled: true },
          { key: 'objective', content: 'Build new high-performance web application from scratch.', enabled: true },
          { key: 'tech_stack', content: '- Next.js App Router\n- TypeScript Strict\n- IndexedDB', enabled: true },
          { key: 'constraints_exclusions', content: '- DO NOT use placeholders.\n- NEVER use any.', enabled: true },
          { key: 'implementation_workflow', content: 'Phase 1 to Phase 5 workflow protocol', enabled: true },
          { key: 'acceptance_criteria', content: '- [ ] 100% responsive across all screens.', enabled: true }
        ]
      },
      {
        id: 'tmpl-debugger',
        sections: [
          { key: 'role', content: 'You are an elite SRE and Senior Systems Debugger.', enabled: true },
          { key: 'objective', content: 'Systematically diagnose root cause and provide surgical fix.', enabled: true },
          { key: 'tech_stack', content: '- Next.js App Router\n- React 19 & TypeScript', enabled: true },
          { key: 'constraints_exclusions', content: '- DO NOT guess randomly or make cosmetic changes.', enabled: true },
          { key: 'implementation_workflow', content: '1. Analyze stack trace\n2. 3 hypotheses\n3. Surgical fix', enabled: true },
          { key: 'acceptance_criteria', content: '- [ ] Reproduction test passes cleanly.', enabled: true }
        ]
      }
    ];

    for (const t of templates) {
      const composed = composePrompt(t.sections.map((s, i) => ({ ...s, id: `${i}`, title: s.key.toUpperCase(), order: i })), 'markdown');
      const audit = auditPromptQuality(t.sections.map((s, i) => ({ ...s, id: `${i}`, title: s.key.toUpperCase(), order: i })), composed);
      assert.ok(audit.score >= 99, `Template ${t.id} scored ${audit.score}, expected >= 99`);
      assert.equal(audit.grade, 'A+');
    }
  });

  test('synthesizes prompt from 1-2 line niche into 99+ completeness score for AI agents', () => {
    const nicheTheme = 'Build an AI-powered invoice generator with PDF exports and team billing';
    const nicheConstraints = 'Next.js App Router, TypeScript strict, sub-100ms latency, zero placeholder comments';

    const sections = [
      { id: '1', key: 'role', title: 'ROLE AND EXPERTISE', content: 'You are an elite Principal Software Architect executing in Cursor Composer.', enabled: true, order: 0 },
      { id: '2', key: 'project_context', title: 'PROJECT CONTEXT', content: nicheConstraints, enabled: true, order: 1 },
      { id: '3', key: 'objective', title: 'OBJECTIVE', content: nicheTheme, enabled: true, order: 2 },
      { id: '4', key: 'functional_requirements', title: 'FUNCTIONAL REQUIREMENTS', content: `1. Core flow: ${nicheTheme}\n2. Constraints: ${nicheConstraints}`, enabled: true, order: 3 },
      { id: '5', key: 'tech_stack', title: 'TECHNOLOGY STACK', content: '- Next.js App Router\n- TypeScript Strict\n- IndexedDB', enabled: true, order: 4 },
      { id: '6', key: 'architecture_requirements', title: 'ARCHITECTURE REQUIREMENTS', content: 'Follow clean modular architecture and offline-first reliability.', enabled: true, order: 5 },
      { id: '7', key: 'constraints_exclusions', title: 'CONSTRAINTS AND EXCLUSIONS', content: '- DO NOT leave placeholder TODO comments.\n- DO NOT use TypeScript any.', enabled: true, order: 6 },
      { id: '8', key: 'implementation_workflow', title: 'IMPLEMENTATION WORKFLOW', content: '1. Inspect\n2. Plan\n3. Execute\n4. Verify tests and build', enabled: true, order: 7 },
      { id: '9', key: 'testing_strategy', title: 'TESTING & ACCEPTANCE CRITERIA', content: '- [ ] Automated tests pass.\n- [ ] 0 build errors.', enabled: true, order: 8 },
      { id: '10', key: 'final_instructions', title: 'FINAL DIRECTIVE', content: 'Execute implementation directly without hesitation.', enabled: true, order: 9 }
    ];

    const composed = composePrompt(sections, 'markdown');
    const audit = auditPromptQuality(sections, composed);

    assert.ok(composed.includes(nicheTheme));
    assert.ok(composed.includes('Cursor Composer'));
    assert.ok(audit.score >= 99, `Quick stepper prompt score ${audit.score} expected >= 99`);
    assert.equal(audit.grade, 'A+');
  });

  test('synthesizes Google Antigravity agent prompt with mandatory skills.sh protocol scoring 99+', () => {
    const nicheTheme = 'Build a high-performance offline prompt builder with responsive canvas';
    const nicheConstraints = 'Zero backend dependencies, IndexedDB persistence, sub-100ms interaction latency';

    const sections = [
      {
        id: '1',
        key: 'role',
        title: 'ROLE AND EXPERTISE',
        content: 'You are an elite Google Antigravity (AGY) Autonomous AI Coding Agent and Principal Systems Architect.',
        enabled: true,
        order: 0
      },
      {
        id: '2',
        key: 'agent_skills',
        title: 'AGENT SKILLS & EXECUTION PROTOCOL (SKILLS.SH)',
        content: 'At EVERY phase and step of development, verify and invoke specialized domain skills from skills.sh (or local .agents/skills/): UI/UX Pro Max, Vercel React Best Practices, Antigravity Agentic Directives. Consult SKILL.md before execution.',
        enabled: true,
        order: 1
      },
      {
        id: '3',
        key: 'project_context',
        title: 'PROJECT CONTEXT',
        content: nicheConstraints,
        enabled: true,
        order: 2
      },
      {
        id: '4',
        key: 'objective',
        title: 'OBJECTIVE',
        content: nicheTheme,
        enabled: true,
        order: 3
      },
      {
        id: '5',
        key: 'functional_requirements',
        title: 'FUNCTIONAL REQUIREMENTS',
        content: `1. Implement user flow: ${nicheTheme}\n2. Constraints: ${nicheConstraints}\n3. Multi-viewport responsive layout.`,
        enabled: true,
        order: 4
      },
      {
        id: '6',
        key: 'tech_stack',
        title: 'TECHNOLOGY STACK',
        content: '- Next.js App Router (TypeScript Strict)\n- React 19 & Vanilla CSS custom tokens\n- Browser IndexedDB',
        enabled: true,
        order: 5
      },
      {
        id: '7',
        key: 'architecture_requirements',
        title: 'ARCHITECTURE REQUIREMENTS',
        content: 'Clean modular architecture separating UI presentation from domain stores. Offline-first resilience.',
        enabled: true,
        order: 6
      },
      {
        id: '8',
        key: 'constraints_exclusions',
        title: 'CONSTRAINTS AND EXCLUSIONS',
        content: '- MANDATORY SKILL USAGE: DO NOT bypass skills.sh or ignore SKILL.md directives.\n- DO NOT leave placeholder comments or "TODO" omissions.\n- DO NOT use TypeScript any.',
        enabled: true,
        order: 7
      },
      {
        id: '9',
        key: 'implementation_workflow',
        title: 'IMPLEMENTATION WORKFLOW (SKILLS-DRIVEN)',
        content: 'Phase 1: Skills Ingestion (skills.sh) → Phase 2: Architectural Plan → Phase 3: Complete Implementation → Phase 4: Verification',
        enabled: true,
        order: 8
      },
      {
        id: '10',
        key: 'testing_strategy',
        title: 'TESTING & ACCEPTANCE CRITERIA',
        content: '- [ ] All core workflows verified.\n- [ ] 100% responsive across mobile, tablet, desktop.\n- [ ] Zero TypeScript or build errors.',
        enabled: true,
        order: 9
      },
      {
        id: '11',
        key: 'final_instructions',
        title: 'FINAL DIRECTIVE',
        content: 'Execute directly adhering to loaded skills.sh guidelines. Run tests and verify build.',
        enabled: true,
        order: 10
      }
    ];

    const composed = composePrompt(sections, 'markdown');
    const audit = auditPromptQuality(sections, composed);

    assert.ok(composed.includes('Google Antigravity'));
    assert.ok(composed.includes('skills.sh'));
    assert.ok(composed.includes('SKILL.md'));
    assert.ok(audit.score >= 99, `Antigravity skills.sh prompt scored ${audit.score}, expected >= 99`);
    assert.equal(audit.grade, 'A+');
  });

  test('synthesizes prompt with NeonDB, Next.js Server Actions, PWA, and Neon connection details scoring 99+', () => {
    const nicheTheme = 'Build a SaaS lead generator and analytics portal';
    const nicheConstraints = 'Serverless Lakebase Postgres, Next.js App Router, Server Actions, PWA offline support';
    const neonDetails = 'postgresql://user:secret@ep-cool-branch.us-east-2.aws.neon.tech/neondb?sslmode=require\nBranch: staging\nTables: leads, events, teams';

    const neonDirective = `1. Database Engine: Lakebase Serverless Postgres on Neon (@neondatabase/serverless or Drizzle / Prisma).
2. Serverless Connection Pooling: Always connect using the Neon pooled connection URL (DATABASE_URL with -pooler) for serverless compute and Next.js Server Actions to prevent connection exhaustion.
3. Migrations & Branching: Direct connection string is reserved exclusively for migrations; leverage Neon database branching for isolated feature development.
4. Next.js Server Actions Integration: Query Neon directly inside Server Actions ('use server') with parameterized queries and strict Zod validation.
Connection & Configuration Details:
\`\`\`
${neonDetails}
\`\`\``;

    const sections = [
      {
        id: '1',
        key: 'role',
        title: 'ROLE AND EXPERTISE',
        content: 'You are an elite Google Antigravity (AGY) Autonomous Lead Agent and Principal Software Architect powered by Google DeepMind.',
        enabled: true,
        order: 0
      },
      {
        id: '2',
        key: 'agent_skills',
        title: 'AGENT SKILLS & EXECUTION PROTOCOL (SKILLS.SH)',
        content: 'At EVERY phase and step of development, verify and invoke specialized domain skills from skills.sh (or local .agents/skills/): Neon Postgres Skill, Vercel React Best Practices, UI/UX Pro Max.',
        enabled: true,
        order: 1
      },
      {
        id: '3',
        key: 'project_context',
        title: 'PROJECT CONTEXT',
        content: nicheConstraints,
        enabled: true,
        order: 2
      },
      {
        id: '4',
        key: 'objective',
        title: 'OBJECTIVE',
        content: nicheTheme,
        enabled: true,
        order: 3
      },
      {
        id: '5',
        key: 'functional_requirements',
        title: 'FUNCTIONAL REQUIREMENTS',
        content: `1. Core flow: ${nicheTheme}.\n2. Server Actions: Implement all data mutations and backend workflows strictly using Server Actions ('use server') instead of API route handlers.\n3. PWA Readiness: Web app manifest and service worker caching strategy.`,
        enabled: true,
        order: 4
      },
      {
        id: '6',
        key: 'tech_stack',
        title: 'TECHNOLOGY STACK',
        content: '- Next.js App Router (TypeScript Strict)\n- Server Actions (Next.js instead of API Routes)\n- NeonDB (Serverless Postgres)\n- PWA (Progressive Web App)\n- React 19',
        enabled: true,
        order: 5
      },
      {
        id: '7',
        key: 'database_specification',
        title: 'DATABASE SPECIFICATION (NEON SERVERLESS POSTGRES)',
        content: neonDirective,
        enabled: true,
        order: 6
      },
      {
        id: '8',
        key: 'architecture_requirements',
        title: 'ARCHITECTURE REQUIREMENTS',
        content: 'Clean modular architecture separating UI presentation from domain stores. PWA manifest and service worker registration for offline caching.',
        enabled: true,
        order: 7
      },
      {
        id: '9',
        key: 'constraints_exclusions',
        title: 'CONSTRAINTS AND EXCLUSIONS',
        content: '- DO NOT create traditional API route handlers (/api/*); strictly use Next.js Server Actions ("use server").\n- DO NOT use unpooled direct database connections in Server Actions; always use the pooled Neon endpoint.\n- DO NOT leave placeholder comments or "TODO" omissions.\n- DO NOT use TypeScript any.',
        enabled: true,
        order: 8
      },
      {
        id: '10',
        key: 'implementation_workflow',
        title: 'IMPLEMENTATION WORKFLOW (SKILLS-DRIVEN)',
        content: 'Phase 1: Ingest Neon & Vercel skills → Phase 2: Schema plan → Phase 3: Implement Server Actions and UI → Phase 4: Verification',
        enabled: true,
        order: 9
      },
      {
        id: '11',
        key: 'testing_strategy',
        title: 'TESTING & ACCEPTANCE CRITERIA',
        content: '- [ ] Server Actions query Neon cleanly with pooled connection.\n- [ ] PWA installs with valid manifest.\n- [ ] Zero build or type errors.',
        enabled: true,
        order: 10
      },
      {
        id: '12',
        key: 'final_instructions',
        title: 'FINAL DIRECTIVE',
        content: 'Execute directly adhering to Neon serverless pooling and Next.js Server Actions directives.',
        enabled: true,
        order: 11
      }
    ];

    const composed = composePrompt(sections, 'markdown');
    const audit = auditPromptQuality(sections, composed);

    assert.ok(composed.includes('NeonDB'));
    assert.ok(composed.includes('Server Actions'));
    assert.ok(composed.includes('PWA (Progressive Web App)'));
    assert.ok(composed.includes('ep-cool-branch.us-east-2.aws.neon.tech'));
    assert.ok(composed.includes('DO NOT create traditional API route handlers'));
    assert.ok(audit.score >= 99, `NeonDB Server Actions prompt scored ${audit.score}, expected >= 99`);
    assert.equal(audit.grade, 'A+');
  });
});



