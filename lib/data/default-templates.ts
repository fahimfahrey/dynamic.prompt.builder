import { PromptCategory, PromptTemplate, PromptSection, TargetModel, TargetModelSpec } from '../types';

export const TARGET_MODELS: TargetModelSpec[] = [
  {
    id: 'antigravity',
    name: 'Google Antigravity (AGY)',
    provider: 'Google DeepMind',
    contextWindow: '2,000,000+ tokens',
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    bestFor: 'Agentic workflows, skills.sh integration, subagents, background tasks, and full-stack software architecture',
    strengths: ['Native Agent Skills integration (skills.sh / .agents/skills)', 'Autonomous multi-step execution', 'Deep code & knowledge synthesis', 'Artifact & test validation']
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    contextWindow: '200,000 tokens',
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    bestFor: 'Extended reasoning, hybrid thinking, coding agents, XML tag parsing',
    strengths: ['Structured XML formatting', 'Chain-of-thought analysis', 'Refactoring complex codebases']
  },
  {
    id: 'gpt-4-5',
    name: 'GPT-4.5 Preview',
    provider: 'OpenAI',
    contextWindow: '128,000 tokens',
    inputCostPer1M: 75.0,
    outputCostPer1M: 150.0,
    bestFor: 'High EQ communication, deep domain synthesis, creative architecture',
    strengths: ['Natural language intuition', 'Multi-disciplinary problem solving', 'Polished explanations']
  },
  {
    id: 'gemini-2-pro',
    name: 'Gemini 2.0 Pro',
    provider: 'Google',
    contextWindow: '2,000,000 tokens',
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.0,
    bestFor: 'Massive codebases, full repo ingestion, high speed multimodal coding',
    strengths: ['2M context window', 'Rapid generation', 'Precise document cross-referencing']
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    contextWindow: '64,000 tokens',
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    bestFor: 'Mathematical rigor, competitive programming, algorithmic optimization',
    strengths: ['Autonomous test case generation', 'Algorithmic efficiency', 'Low compute cost']
  },
  {
    id: 'universal',
    name: 'Universal LLM Engine',
    provider: 'Cross-Model',
    contextWindow: '128,000+ tokens',
    inputCostPer1M: 2.0,
    outputCostPer1M: 8.0,
    bestFor: 'Any LLM including Cursor, Windsurf, Claude Code, GitHub Copilot, Llama 3.3',
    strengths: ['Universal Markdown standards', 'Role & constraint clarity', 'Portable prompt semantics']
  }
];

export const STANDARD_SECTION_TEMPLATES = [
  {
    key: 'role',
    title: 'ROLE AND EXPERTISE',
    defaultContent: 'Act as a principal software architect, senior Next.js engineer, and UI/UX systems specialist with extensive production experience.',
    enabled: true
  },
  {
    key: 'project_context',
    title: 'PROJECT CONTEXT',
    defaultContent: 'This project is a high-performance modern web application built for developers and engineering teams.',
    enabled: true
  },
  {
    key: 'objective',
    title: 'OBJECTIVE',
    defaultContent: 'Build a production-ready, accessible, and responsive feature from scratch with strict type safety.',
    enabled: true
  },
  {
    key: 'existing_situation',
    title: 'EXISTING SITUATION',
    defaultContent: 'The existing codebase has foundational layout components and configuration, but needs the core feature implemented cleanly.',
    enabled: false
  },
  {
    key: 'desired_outcome',
    title: 'DESIRED OUTCOME',
    defaultContent: 'A fully functional, visually polished, tested, and self-contained module that integrates smoothly with zero regressions.',
    enabled: true
  },
  {
    key: 'functional_requirements',
    title: 'FUNCTIONAL REQUIREMENTS',
    defaultContent: '1. Allow users to configure parameters seamlessly.\n2. Provide immediate real-time feedback on user actions.\n3. Support import and export of user data.',
    enabled: true
  },
  {
    key: 'nonfunctional_requirements',
    title: 'NON-FUNCTIONAL REQUIREMENTS',
    defaultContent: '1. Sub-100ms UI interaction latency.\n2. Full keyboard navigation and WCAG AA contrast compliance.\n3. Resilient error handling with user-friendly notices.',
    enabled: false
  },
  {
    key: 'tech_stack',
    title: 'TECHNOLOGY STACK',
    defaultContent: '- Framework: Next.js App Router\n- Language: TypeScript (Strict mode)\n- Styling: Modern CSS with custom tokens\n- Icons: Lucide React\n- Storage: Browser IndexedDB',
    enabled: true
  },
  {
    key: 'architecture_requirements',
    title: 'ARCHITECTURE REQUIREMENTS',
    defaultContent: 'Follow a clean modular architecture: separate presentation components from business logic and data access repositories.',
    enabled: false
  },
  {
    key: 'design_system',
    title: 'DESIGN SYSTEM & UI/UX',
    defaultContent: 'Professional developer tool aesthetic: dark OLED mode, restrained color usage, crisp borders, semantic tokens, and no decorative fluff.',
    enabled: false
  },
  {
    key: 'data_model',
    title: 'DATA MODEL & PERSISTENCE',
    defaultContent: 'Use browser IndexedDB for local persistence with clear schema versioning, transaction isolation, and JSON backup/restore capabilities.',
    enabled: false
  },
  {
    key: 'security_requirements',
    title: 'SECURITY REQUIREMENTS',
    defaultContent: 'Sanitize all user inputs, avoid eval/Function execution, and validate imported JSON data before processing.',
    enabled: false
  },
  {
    key: 'performance_requirements',
    title: 'PERFORMANCE REQUIREMENTS',
    defaultContent: 'Zero hydration mismatches, memoize expensive calculations, avoid unnecessary re-renders, and ensure instantaneous local search.',
    enabled: false
  },
  {
    key: 'accessibility',
    title: 'ACCESSIBILITY REQUIREMENTS',
    defaultContent: 'Semantic HTML5 tags, visible focus rings, aria-labels on icon buttons, keyboard shortcuts, and screen-reader tested status updates.',
    enabled: false
  },
  {
    key: 'seo_requirements',
    title: 'SEO & METADATA',
    defaultContent: 'Proper title, meta descriptions, Open Graph cards, dynamic sitemap.xml, and clean canonical URLs.',
    enabled: false
  },
  {
    key: 'implementation_workflow',
    title: 'IMPLEMENTATION WORKFLOW',
    defaultContent: '1. Inspect existing code before making changes.\n2. Create modular implementation plan.\n3. Implement foundational components.\n4. Connect reactive state.\n5. Run verification tests.',
    enabled: true
  },
  {
    key: 'coding_standards',
    title: 'CODING STANDARDS',
    defaultContent: 'Follow modern idiomatic patterns. Prefer pure functions, avoid mutable module state, and document non-obvious architecture decisions.',
    enabled: false
  },
  {
    key: 'testing_strategy',
    title: 'TESTING STRATEGY',
    defaultContent: 'Write automated unit tests for business logic and state transformations. Verify build succeeds with zero TypeScript or lint errors.',
    enabled: true
  },
  {
    key: 'acceptance_criteria',
    title: 'ACCEPTANCE CRITERIA',
    defaultContent: '- [ ] All primary user workflows function end-to-end.\n- [ ] Persistence works offline via IndexedDB.\n- [ ] TypeScript check and production build pass with 0 errors.',
    enabled: true
  },
  {
    key: 'constraints_exclusions',
    title: 'CONSTRAINTS AND EXCLUSIONS',
    defaultContent: '- DO NOT introduce external API dependencies or simulated backend services.\n- DO NOT leave placeholder comments or unfinished "TODO" blocks.\n- DO NOT use generic AI template designs.',
    enabled: true
  },
  {
    key: 'deliverables',
    title: 'DELIVERABLES',
    defaultContent: '1. Complete source code files with no placeholders.\n2. Automated tests verifying critical paths.\n3. Summary of architecture decisions and verification steps.',
    enabled: true
  },
  {
    key: 'final_instructions',
    title: 'FINAL DIRECTIVE',
    defaultContent: 'Execute the implementation directly, run the test suites and production build, and confirm all user flows work smoothly.',
    enabled: true
  }
];

export const DEFAULT_PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'software-development',
    name: 'Software Development',
    slug: 'software-development',
    description: 'Prompts for engineering agents, feature builders, bug fixes, and code reviews',
    iconName: 'Code2'
  },
  {
    id: 'frontend-design',
    name: 'Design & Frontend',
    slug: 'frontend-design',
    description: 'Prompts for design systems, UI/UX polish, landing pages, and accessibility',
    iconName: 'Layout'
  },
  {
    id: 'technical-planning',
    name: 'Technical Planning',
    slug: 'technical-planning',
    description: 'Prompts for system architecture, technical documentation, and migration strategies',
    iconName: 'FileText'
  },
  {
    id: 'general-ai',
    name: 'General AI Workflows',
    slug: 'general-ai',
    description: 'Prompts for deep research, requirements analysis, and problem-solving',
    iconName: 'Sparkles'
  }
];

export const BUILT_IN_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tmpl-refurbish-existing-app',
    title: 'Refurbish Existing Codebase into Production Dev Tool',
    slug: 'refurbish-existing-codebase',
    description: 'Turn an existing codebase into a polished, production-ready product by removing unwanted code, preserving infrastructure, and adding core features.',
    category: 'software-development',
    tags: ['Refactoring', 'Architecture', 'Next.js', 'Clean Code'],
    targetModel: 'claude-3-7-sonnet',
    outputFormat: 'markdown',
    isBuiltIn: true,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    sections: [
      {
        key: 'role',
        title: 'ROLE AND EXPERTISE',
        content: 'Act as a principal software architect, senior frontend systems engineer, and QA specialist with deep production Next.js experience.',
        enabled: true,
        order: 0
      },
      {
        key: 'project_context',
        title: 'PROJECT CONTEXT',
        content: 'You are refurbishing an existing application. An earlier implementation added unwanted features. Inspect the existing repository thoroughly, retain working reusable infrastructure, remove out-of-scope code, and implement the true product.',
        enabled: true,
        order: 1
      },
      {
        key: 'objective',
        title: 'OBJECTIVE',
        content: 'Refurbish the codebase into a high-performance, polished developer tool with 100% responsive layouts, zero hydration errors, and seamless offline persistence.',
        enabled: true,
        order: 2
      },
      {
        key: 'functional_requirements',
        title: 'FUNCTIONAL REQUIREMENTS',
        content: '1. Remove all out-of-scope marketing copy, payment funnels, and fake APIs.\n2. Preserve existing design tokens, icons, and local persistence layer.\n3. Implement the primary user workflow with dynamic selectable configuration, live previews, and one-click copy/export.\n4. Ensure 100% responsiveness across all device widths (320px mobile to 4K ultrawide).',
        enabled: true,
        order: 3
      },
      {
        key: 'tech_stack',
        title: 'TECHNOLOGY STACK',
        content: '- Next.js App Router (TypeScript with strict types)\n- React 19 & Vanilla CSS custom tokens\n- Browser IndexedDB for offline-first persistence\n- Lucide icons & Node.js test runner',
        enabled: true,
        order: 4
      },
      {
        key: 'architecture_requirements',
        title: 'ARCHITECTURE REQUIREMENTS',
        content: 'Enforce clean separation between client-side interactive state, presentation components, and deterministic generation engines. No unnecessary server actions or external backend abstractions.',
        enabled: true,
        order: 5
      },
      {
        key: 'constraints_exclusions',
        title: 'CONSTRAINTS AND EXCLUSIONS',
        content: '- DO NOT build a backend service or introduce external API dependencies.\n- DO NOT leave broken navigation links, dead buttons, or placeholder screens.\n- DO NOT use lazy placeholder comments or truncated "TODO" implementations.\n- DO NOT use TypeScript "any"; maintain strict type safety.',
        enabled: true,
        order: 6
      },
      {
        key: 'implementation_workflow',
        title: 'IMPLEMENTATION WORKFLOW',
        content: '1. Audit package.json and existing files before editing.\n2. Identify what to remove vs what to reuse.\n3. Refactor core models, utilities, and UI components.\n4. Validate responsive behavior and run automated tests.\n5. Run production build and verify all links.',
        enabled: true,
        order: 7
      },
      {
        key: 'testing_strategy',
        title: 'TESTING & VERIFICATION STRATEGY',
        content: 'Run automated unit tests for domain logic and compiler functions. Execute TypeScript checks and production Next.js build. Verify responsive layouts on 320px mobile, tablet, and desktop.',
        enabled: true,
        order: 8
      },
      {
        key: 'acceptance_criteria',
        title: 'ACCEPTANCE CRITERIA',
        content: '- [ ] Only relevant features remain visible and functional.\n- [ ] Offline persistence works reliably via IndexedDB.\n- [ ] UI is 100% responsive across mobile, tablet, and desktop without horizontal scrollbars.\n- [ ] TypeScript check and production build pass with 0 errors.',
        enabled: true,
        order: 9
      },
      {
        key: 'deliverables',
        title: 'DELIVERABLES',
        content: '1. Complete, runnable source code with no placeholder omissions.\n2. Passing automated test suites.\n3. Summary of removed, reused, and rebuilt architecture.',
        enabled: true,
        order: 10
      },
      {
        key: 'final_instructions',
        title: 'FINAL DIRECTIVE',
        content: 'Execute the refurbishment directly in the codebase, verify functionality in terminal, and present the final outcome.',
        enabled: true,
        order: 11
      }
    ]
  },
  {
    id: 'tmpl-build-new-app',
    title: 'Greenfield Full-Stack Web Application Architect',
    slug: 'build-new-fullstack-app',
    description: 'Comprehensive prompt for creating a production-grade web application from scratch with modern architecture, accessibility, and offline resilience.',
    category: 'software-development',
    tags: ['Full-Stack', 'Next.js', 'Architecture', 'Greenfield'],
    targetModel: 'claude-3-7-sonnet',
    outputFormat: 'markdown',
    isBuiltIn: true,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    sections: [
      {
        key: 'role',
        title: 'ROLE AND EXPERTISE',
        content: 'Act as a principal full-stack software engineer and system architect specializing in robust TypeScript applications.',
        enabled: true,
        order: 0
      },
      {
        key: 'project_context',
        title: 'PROJECT CONTEXT',
        content: 'You are designing and building a new greenfield web application from scratch. The product must deliver immediate value, high aesthetic polish, and seamless offline-first capabilities.',
        enabled: true,
        order: 1
      },
      {
        key: 'objective',
        title: 'OBJECTIVE',
        content: 'Design and build a complete, production-ready web application from scratch with rich aesthetics, instant responsiveness, and zero external backend overhead.',
        enabled: true,
        order: 2
      },
      {
        key: 'functional_requirements',
        title: 'FUNCTIONAL REQUIREMENTS',
        content: '1. Complete user flows with zero dead ends.\n2. Fast searching, filtering, and sorting in sub-50ms.\n3. 100% responsive across mobile, tablet, and desktop.\n4. Comprehensive data import and export via validated JSON.',
        enabled: true,
        order: 3
      },
      {
        key: 'tech_stack',
        title: 'TECHNOLOGY STACK',
        content: '- Next.js App Router (TypeScript with strict typing)\n- Modern CSS with custom tokens and dark OLED theme\n- Browser IndexedDB for client persistence\n- Lucide icons',
        enabled: true,
        order: 4
      },
      {
        key: 'architecture_requirements',
        title: 'ARCHITECTURE REQUIREMENTS',
        content: 'Follow clean domain-driven architecture: separate view layer from business logic repositories and browser storage adapters.',
        enabled: true,
        order: 5
      },
      {
        key: 'constraints_exclusions',
        title: 'CONSTRAINTS AND EXCLUSIONS',
        content: '- NO placeholder TODO comments or truncated snippets.\n- NO generic template aesthetics.\n- NO unnecessary external bloat or unneeded packages.\n- NO TypeScript "any".',
        enabled: true,
        order: 6
      },
      {
        key: 'implementation_workflow',
        title: 'IMPLEMENTATION WORKFLOW',
        content: '1. Design core domain model and storage schema.\n2. Author foundational UI design system and components.\n3. Implement reactive application state and persistence.\n4. Build views and polish micro-interactions.\n5. Verify automated tests and production build.',
        enabled: true,
        order: 7
      },
      {
        key: 'testing_strategy',
        title: 'TESTING STRATEGY',
        content: 'Write automated unit tests for business logic and state transformations. Ensure type check and production build pass with 0 errors.',
        enabled: true,
        order: 8
      },
      {
        key: 'acceptance_criteria',
        title: 'ACCEPTANCE CRITERIA',
        content: '- [ ] All application features functional end-to-end.\n- [ ] UI is responsive across 320px to 4K resolutions.\n- [ ] Zero hydration warnings in console.\n- [ ] Production build succeeds cleanly.',
        enabled: true,
        order: 9
      },
      {
        key: 'deliverables',
        title: 'DELIVERABLES',
        content: 'Complete runnable application source files, automated tests, and clear deployment documentation.',
        enabled: true,
        order: 10
      },
      {
        key: 'final_instructions',
        title: 'FINAL DIRECTIVE',
        content: 'Implement all modules cleanly, run the verification commands, and provide a clear usage guide.',
        enabled: true,
        order: 11
      }
    ]
  },
  {
    id: 'tmpl-root-cause-debugger',
    title: 'Hypothesis-Driven Root Cause Debugger & SRE',
    slug: 'root-cause-debugger',
    description: 'Diagnose tricky runtime errors, hydration mismatches, and race conditions by generating 3 ranked hypotheses before touching code.',
    category: 'software-development',
    tags: ['Debugging', 'Next.js', 'Hydration', 'Root Cause'],
    targetModel: 'claude-3-7-sonnet',
    outputFormat: 'markdown',
    isBuiltIn: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    sections: [
      {
        key: 'role',
        title: 'ROLE AND EXPERTISE',
        content: 'You are an elite Site Reliability Engineer and Senior Systems Debugger with expertise in Next.js, React lifecycle timings, and concurrency.',
        enabled: true,
        order: 0
      },
      {
        key: 'project_context',
        title: 'PROJECT CONTEXT',
        content: 'A regression or unexpected runtime failure has been observed in production/testing. A surgical, hypothesis-driven investigation is required.',
        enabled: true,
        order: 1
      },
      {
        key: 'objective',
        title: 'OBJECTIVE',
        content: 'Systematically diagnose the root cause and provide a surgical fix with regression prevention safeguards.',
        enabled: true,
        order: 2
      },
      {
        key: 'existing_situation',
        title: 'EXISTING SITUATION & ERROR CONTEXT',
        content: 'Paste error stack trace, component lifecycle log, and the code snippet under inspection here.',
        enabled: true,
        order: 3
      },
      {
        key: 'tech_stack',
        title: 'TECHNOLOGY STACK',
        content: '- Next.js App Router & React 19\n- TypeScript in strict mode\n- Node.js runtime and browser APIs',
        enabled: true,
        order: 4
      },
      {
        key: 'implementation_workflow',
        title: 'DEBUGGING PROTOCOL',
        content: '1. Analyze stack trace and lifecycle timing.\n2. Formulate 3 distinct hypotheses ranked by probability (High, Medium, Low).\n3. Test each hypothesis against the code.\n4. Provide complete, drop-in replacement fix.',
        enabled: true,
        order: 5
      },
      {
        key: 'constraints_exclusions',
        title: 'CONSTRAINTS AND EXCLUSIONS',
        content: '- DO NOT guess randomly or make cosmetic changes that mask the real bug.\n- DO NOT introduce new dependencies or rewrite unrelated code.\n- Preserve existing code comments and public interfaces.',
        enabled: true,
        order: 6
      },
      {
        key: 'testing_strategy',
        title: 'TESTING & REPRODUCTION STRATEGY',
        content: 'Author a reproduction test case that fails before the fix and passes cleanly after the fix.',
        enabled: true,
        order: 7
      },
      {
        key: 'acceptance_criteria',
        title: 'ACCEPTANCE CRITERIA',
        content: '- [ ] Root cause identified and explained with technical precision.\n- [ ] Minimal code diff fixes the issue completely.\n- [ ] No regression introduced into adjacent features.\n- [ ] Reproduction test passes cleanly.',
        enabled: true,
        order: 8
      },
      {
        key: 'deliverables',
        title: 'DELIVERABLES',
        content: '1. Root cause post-mortem breakdown.\n2. Complete, surgical code fix.\n3. Automated regression test.',
        enabled: true,
        order: 9
      },
      {
        key: 'final_instructions',
        title: 'FINAL DIRECTIVE',
        content: 'Deliver the hypothesis analysis followed by the surgical code patch and verification test.',
        enabled: true,
        order: 10
      }
    ]
  },
  {
    id: 'tmpl-create-design-system',
    title: 'Design System, Tokens & Accessible Component Architecture',
    slug: 'create-design-system',
    description: 'Establish a cohesive, accessible design system with CSS custom properties, color tokens, typography scales, and reusable UI components.',
    category: 'frontend-design',
    tags: ['Design System', 'UI/UX', 'Tokens', 'Accessibility'],
    targetModel: 'universal',
    outputFormat: 'markdown',
    isBuiltIn: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    sections: [
      {
        key: 'role',
        title: 'ROLE AND EXPERTISE',
        content: 'Act as a principal design technologist, UI/UX systems engineer, and accessibility specialist.',
        enabled: true,
        order: 0
      },
      {
        key: 'project_context',
        title: 'PROJECT CONTEXT',
        content: 'The product requires a cohesive, state-of-the-art developer tool design system that looks extremely premium, modern, and responsive across all screen sizes.',
        enabled: true,
        order: 1
      },
      {
        key: 'objective',
        title: 'OBJECTIVE',
        content: 'Create a scalable, accessible design token architecture and reusable UI component set for high-end web applications with 100% responsiveness.',
        enabled: true,
        order: 2
      },
      {
        key: 'tech_stack',
        title: 'TECHNOLOGY STACK',
        content: '- Next.js App Router & React 19\n- Modern Vanilla CSS with semantic design tokens\n- Lucide React icon set\n- WAI-ARIA authoring practices',
        enabled: true,
        order: 3
      },
      {
        key: 'design_system',
        title: 'DESIGN SYSTEM REQUIREMENTS',
        content: '- Dark OLED mode by default with seamless light mode token mapping.\n- Semantic token names (bg-primary, text-primary, border-subtle, accent-cyan).\n- Accessible focus-visible indicators on all interactive elements.\n- 44x44px minimum touch targets on mobile viewports.',
        enabled: true,
        order: 4
      },
      {
        key: 'functional_requirements',
        title: 'COMPONENT SPECIFICATIONS',
        content: 'Define Button, Card, Badge, Input, Select, Modal, Drawer, Tabs, and Toast components with consistent prop interfaces and zero layout shift.',
        enabled: true,
        order: 5
      },
      {
        key: 'constraints_exclusions',
        title: 'CONSTRAINTS AND EXCLUSIONS',
        content: '- DO NOT use generic AI-template aesthetics or oversized empty heroes.\n- DO NOT hardcode arbitrary colors; use semantic CSS tokens.\n- DO NOT introduce heavy UI component libraries solely for styling.',
        enabled: true,
        order: 6
      },
      {
        key: 'implementation_workflow',
        title: 'IMPLEMENTATION WORKFLOW',
        content: '1. Establish CSS variable token scale (colors, shadows, radii, transitions).\n2. Build reusable accessible atom components.\n3. Create layout containers and responsive grids.\n4. Verify contrast ratios and keyboard navigation.',
        enabled: true,
        order: 7
      },
      {
        key: 'accessibility',
        title: 'ACCESSIBILITY STANDARDS',
        content: 'Maintain minimum 4.5:1 text contrast. Ensure all modal dialogs trap focus and support Escape to dismiss.',
        enabled: true,
        order: 8
      },
      {
        key: 'testing_strategy',
        title: 'TESTING & AUDIT STRATEGY',
        content: 'Audit with WCAG 2.1 AA checklist, verify keyboard tab order, and test on 320px mobile viewports.',
        enabled: true,
        order: 9
      },
      {
        key: 'acceptance_criteria',
        title: 'ACCEPTANCE CRITERIA',
        content: '- [ ] Design tokens documented and responsive.\n- [ ] All components support keyboard navigation and visible focus rings.\n- [ ] Zero horizontal overflow on mobile viewports.',
        enabled: true,
        order: 10
      },
      {
        key: 'deliverables',
        title: 'DELIVERABLES',
        content: 'Global CSS variables stylesheet, complete component source files, and responsive showcase documentation.',
        enabled: true,
        order: 11
      },
      {
        key: 'final_instructions',
        title: 'FINAL DIRECTIVE',
        content: 'Build the design tokens and component library cleanly, ensuring high aesthetic polish and zero regressions.',
        enabled: true,
        order: 12
      }
    ]
  },
  {
    id: 'tmpl-system-architecture-plan',
    title: 'System Architecture & Technical RFC Specification',
    slug: 'system-architecture-plan',
    description: 'Author a comprehensive technical architecture document covering domain models, data flows, persistence, error boundaries, and quality gates.',
    category: 'technical-planning',
    tags: ['Architecture', 'System Design', 'Technical Specs', 'Planning'],
    targetModel: 'claude-3-7-sonnet',
    outputFormat: 'markdown',
    isBuiltIn: true,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    sections: [
      {
        key: 'role',
        title: 'ROLE AND EXPERTISE',
        content: 'Act as a chief software architect and technical lead with deep systems engineering experience.',
        enabled: true,
        order: 0
      },
      {
        key: 'project_context',
        title: 'PROJECT CONTEXT',
        content: 'A new product initiative requires a production-grade Technical RFC specification to align engineering teams and guide AI coding agents.',
        enabled: true,
        order: 1
      },
      {
        key: 'objective',
        title: 'OBJECTIVE',
        content: 'Generate a production-grade system architecture and technical specification for the planned software application.',
        enabled: true,
        order: 2
      },
      {
        key: 'tech_stack',
        title: 'TARGET ARCHITECTURE STACK',
        content: '- Next.js App Router (TypeScript Strict)\n- React Server Components & interactive Client boundaries\n- Offline-first IndexedDB persistence with schema migrations\n- Automated CI/CD verification pipeline',
        enabled: true,
        order: 3
      },
      {
        key: 'architecture_requirements',
        title: 'SPECIFICATION AREAS',
        content: '1. Executive Summary & Problem Space\n2. Domain Model & ERD Relationships\n3. Client & Server Module Boundaries\n4. Data Persistence & Caching Strategy\n5. Security & Input Sanitization Model\n6. Quality Gates & Verification Matrix',
        enabled: true,
        order: 4
      },
      {
        key: 'constraints_exclusions',
        title: 'CONSTRAINTS AND EXCLUSIONS',
        content: '- DO NOT overengineer or introduce unnecessary microservices.\n- DO NOT leave architecture trade-offs unexamined.\n- Design a cohesive, maintainable modular architecture.',
        enabled: true,
        order: 5
      },
      {
        key: 'implementation_workflow',
        title: 'IMPLEMENTATION WORKFLOW',
        content: '1. Analyze domain requirements and data access patterns.\n2. Define interface contracts and data models.\n3. Map state flows and error boundaries.\n4. Specify test verification gates and acceptance criteria.',
        enabled: true,
        order: 6
      },
      {
        key: 'testing_strategy',
        title: 'TESTING & QUALITY GATES',
        content: 'Define explicit automated test thresholds: unit test coverage for pure logic, integration tests for storage, and build verification.',
        enabled: true,
        order: 7
      },
      {
        key: 'acceptance_criteria',
        title: 'ACCEPTANCE CRITERIA',
        content: '- [ ] Complete RFC document authored with technical clarity.\n- [ ] Data flows and boundaries clearly specified.\n- [ ] Error recovery strategies defined for all critical paths.',
        enabled: true,
        order: 8
      },
      {
        key: 'deliverables',
        title: 'DELIVERABLES',
        content: 'Complete markdown specification document with Mermaid architecture diagrams and technical rationale.',
        enabled: true,
        order: 9
      },
      {
        key: 'final_instructions',
        title: 'FINAL DIRECTIVE',
        content: 'Deliver the comprehensive technical RFC document ready for immediate developer and AI agent execution.',
        enabled: true,
        order: 10
      }
    ]
  },
  {
    id: 'tmpl-ai-coding-agent-director',
    title: 'Autonomous AI Coding Agent Director (Cursor / Claude Code / Cline)',
    slug: 'ai-coding-agent-director',
    description: 'Disciplined instruction prompt for AI coding agents to inspect before editing, prevent lazy placeholders, maintain strict types, and verify tests.',
    category: 'software-development',
    tags: ['AI Agent', 'Cursor', 'Windsurf', 'Claude Code', 'Pair Programming'],
    targetModel: 'claude-3-7-sonnet',
    outputFormat: 'markdown',
    isBuiltIn: true,
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
    sections: [
      {
        key: 'role',
        title: 'ROLE AND EXPERTISE',
        content: 'You are an elite Staff Software Engineer and Autonomous AI Coding Agent pair-programming directly in the user repository.',
        enabled: true,
        order: 0
      },
      {
        key: 'project_context',
        title: 'PROJECT CONTEXT',
        content: 'You have terminal and file system access. You are implementing a mission-critical feature in an existing codebase.',
        enabled: true,
        order: 1
      },
      {
        key: 'objective',
        title: 'OBJECTIVE',
        content: 'Implement the requested feature end-to-end with zero regressions, strict type safety, complete drop-in code, and verified build output.',
        enabled: true,
        order: 2
      },
      {
        key: 'functional_requirements',
        title: 'CORE BEHAVIORAL PROTOCOL',
        content: '1. Inspect the codebase first before proposing any edits.\n2. Formulate a concise step-by-step implementation plan.\n3. Implement complete, runnable code without lazy "TODO" omissions.\n4. Run tests and production build to verify zero regressions.',
        enabled: true,
        order: 3
      },
      {
        key: 'tech_stack',
        title: 'TECHNOLOGY STACK',
        content: '- Next.js App Router (TypeScript Strict)\n- React 19 & Vanilla CSS design tokens\n- Browser IndexedDB for offline-first persistence',
        enabled: true,
        order: 4
      },
      {
        key: 'constraints_exclusions',
        title: 'CONSTRAINTS AND EXCLUSIONS',
        content: '- DO NOT output partial code or ask the user to "fill in the rest".\n- DO NOT introduce TypeScript "any" or disable linting rules.\n- DO NOT introduce unwanted backend services or mock API routes.\n- DO NOT break existing navigation or leave dead links.',
        enabled: true,
        order: 5
      },
      {
        key: 'implementation_workflow',
        title: 'IMPLEMENTATION WORKFLOW',
        content: 'Phase 1: Inspect repository structure and dependencies.\nPhase 2: Author concise plan.\nPhase 3: Implement core domain logic and UI.\nPhase 4: Run unit tests and Next.js build.\nPhase 5: Report exact files modified and verification results.',
        enabled: true,
        order: 6
      },
      {
        key: 'testing_strategy',
        title: 'VERIFICATION COMMANDS',
        content: 'Execute npm test, TypeScript compiler check, and npm run build. Fix any encountered errors before declaring completion.',
        enabled: true,
        order: 7
      },
      {
        key: 'acceptance_criteria',
        title: 'ACCEPTANCE CRITERIA',
        content: '- [ ] All requested functionality implemented and verified.\n- [ ] TypeScript check and production build pass with 0 errors.\n- [ ] 100% responsive across mobile and desktop viewports.',
        enabled: true,
        order: 8
      },
      {
        key: 'deliverables',
        title: 'DELIVERABLES',
        content: 'Complete code changes, test execution logs, and concise operational summary.',
        enabled: true,
        order: 9
      },
      {
        key: 'final_instructions',
        title: 'FINAL DIRECTIVE',
        content: 'Proceed directly with Phase 1 inspection and execute the complete implementation.',
        enabled: true,
        order: 10
      }
    ]
  }
];

export const DEFAULT_WORKSPACE_SETTINGS = {
  theme: 'dark' as const,
  defaultOutputFormat: 'markdown' as const,
  defaultTargetModel: 'claude-3-7-sonnet' as const,
  autoSave: true,
  showQualityPanel: true
};

// ==================== SELECTABLE BOILERPLATE PRESETS ====================

export interface SelectableBoilerplateOption {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  category: 'role' | 'stack' | 'guardrails' | 'workflow' | 'testing' | 'architecture' | 'skill';
  snippet: string;
}

export const SELECTABLE_ROLE_PRESETS: SelectableBoilerplateOption[] = [
  {
    id: 'role-antigravity',
    label: '⭐ Google Antigravity Lead Agent',
    description: 'Agentic autonomy, skills.sh integration, subagents, background tasks',
    category: 'role',
    snippet: 'You are an elite Google Antigravity (AGY) Autonomous Lead Agent and Principal Software Architect powered by Google DeepMind. Execute autonomously across the repository: strictly consult domain skills (skills.sh / .agents/skills) at every step, use subagents for complex tasks, run automated background test commands, and produce verified, production-grade code without placeholders.'
  },
  {
    id: 'role-architect',
    label: 'Principal Software Architect',
    description: 'System-level architecture, scalability, modular boundaries',
    category: 'role',
    snippet: 'Act as a principal software architect, senior Next.js engineer, and UI/UX systems specialist with deep production engineering experience.'
  },
  {
    id: 'role-fullstack',
    label: 'Senior Full-Stack Engineer',
    description: 'End-to-end features, strict TypeScript, reliable data flows',
    category: 'role',
    snippet: 'Act as a senior full-stack engineer specializing in end-to-end web applications, strict TypeScript architecture, and reliable client-side data persistence.'
  },
  {
    id: 'role-frontend-ui',
    label: 'Frontend Systems & UI/UX Specialist',
    description: 'Aesthetic polish, micro-interactions, responsive mastery',
    category: 'role',
    snippet: 'Act as a lead frontend systems engineer, design technologist, and accessibility specialist focusing on high-polish micro-interactions, dark mode aesthetics, and zero layout shifts.'
  },
  {
    id: 'role-agent-director',
    label: 'AI Coding Agent Tech Lead',
    description: 'Autonomous execution, inspect before edit, zero TODOs',
    category: 'role',
    snippet: 'You are an elite Staff Software Engineer and Autonomous AI Coding Agent pair-programming directly in the repository with strict discipline, skills.sh adherence, and verification.'
  },
  {
    id: 'role-sre-debugger',
    label: 'SRE & Root-Cause Debugger',
    description: 'Hypothesis-driven diagnosis, lifecycle timing, surgical fixes',
    category: 'role',
    snippet: 'You are an elite Site Reliability Engineer and Senior Systems Debugger specializing in hypothesis-driven diagnosis, concurrency, and regression prevention.'
  },
  {
    id: 'role-security',
    label: 'Security & Vulnerability Auditor',
    description: 'Input sanitization, OWASP Top 10, data isolation',
    category: 'role',
    snippet: 'Act as a principal application security engineer and penetration tester auditing web applications against OWASP Top 10, sanitization, and data isolation.'
  }
];

export const SELECTABLE_TECH_STACK_CHIPS: SelectableBoilerplateOption[] = [
  { id: 'stack-nextjs', label: 'Next.js App Router', category: 'stack', snippet: '- Next.js App Router' },
  { id: 'stack-server-actions', label: 'Server Actions (No API Routes)', category: 'stack', snippet: '- Next.js Server Actions: Execute all mutations and server logic strictly via Server Actions ("use server") instead of API route handlers (DO NOT create /api/* route files)' },
  { id: 'stack-neondb', label: 'NeonDB (Serverless Postgres)', category: 'stack', snippet: '- NeonDB: Lakebase Serverless Postgres (@neondatabase/serverless or Drizzle / Prisma) with pooled connection string for serverless compute' },
  { id: 'stack-pwa', label: 'PWA (Progressive Web App)', category: 'stack', snippet: '- PWA (Progressive Web App): Web App Manifest, Service Worker caching strategies, offline fallback, and installable PWA experience' },
  { id: 'stack-react19', label: 'React 19', category: 'stack', snippet: '- React 19' },
  { id: 'stack-typescript', label: 'TypeScript (Strict)', category: 'stack', snippet: '- TypeScript in strict mode (no any)' },
  { id: 'stack-css-tokens', label: 'Vanilla CSS Tokens', category: 'stack', snippet: '- Modern CSS with custom semantic design tokens' },
  { id: 'stack-tailwind', label: 'Tailwind CSS', category: 'stack', snippet: '- Tailwind CSS with clean utility classes' },
  { id: 'stack-idb', label: 'IndexedDB (Offline-First)', category: 'stack', snippet: '- Browser IndexedDB for robust client-side persistence' },
  { id: 'stack-lucide', label: 'Lucide Icons', category: 'stack', snippet: '- Lucide React icons' },
  { id: 'stack-nodejs', label: 'Node.js Runtime', category: 'stack', snippet: '- Node.js runtime environment' },
  { id: 'stack-vitest', label: 'Vitest / Node Test Runner', category: 'stack', snippet: '- Automated unit test runner' },
  { id: 'stack-playwright', label: 'Playwright E2E', category: 'stack', snippet: '- Playwright browser verification' },
  { id: 'stack-postgres', label: 'PostgreSQL & Prisma', category: 'stack', snippet: '- PostgreSQL relational schema with Prisma ORM' },
  { id: 'stack-docker', label: 'Docker Container', category: 'stack', snippet: '- Multi-stage Docker containerization' }
];

export const SELECTABLE_GUARDRAIL_CHIPS: SelectableBoilerplateOption[] = [
  {
    id: 'guard-no-todos',
    label: '❌ No Placeholder TODOs',
    category: 'guardrails',
    snippet: '- DO NOT use lazy placeholder comments, truncated snippets, or "TODO" omissions; provide complete, runnable drop-in code.'
  },
  {
    id: 'guard-no-any',
    label: '❌ No TypeScript "any"',
    category: 'guardrails',
    snippet: '- DO NOT use TypeScript "any"; enforce strict type inference, interfaces, and exhaustive checks.'
  },
  {
    id: 'guard-no-backend',
    label: '❌ No External Server APIs',
    category: 'guardrails',
    snippet: '- DO NOT introduce external backend services, mock APIs, or server dependencies for browser-native client operations.'
  },
  {
    id: 'guard-no-generic-ui',
    label: '❌ No Generic AI Aesthetics',
    category: 'guardrails',
    snippet: '- DO NOT use generic AI-template aesthetics, excessive gradients, or oversized empty hero sections; maintain precision developer tooling UI.'
  },
  {
    id: 'guard-no-break-nav',
    label: '❌ No Broken Navigation / Dead Links',
    category: 'guardrails',
    snippet: '- DO NOT leave broken navigation links, placeholder pages, or non-functional buttons; every visible element must work.'
  },
  {
    id: 'guard-no-unhandled-errors',
    label: '❌ Defensive Error Handling',
    category: 'guardrails',
    snippet: '- DO NOT ignore error states; wrap fallible I/O in defensive try/catch blocks with user-friendly notices.'
  },
  {
    id: 'guard-no-bloat',
    label: '❌ Zero Dependency Bloat',
    category: 'guardrails',
    snippet: '- DO NOT introduce unnecessary heavy third-party packages when standard native browser capabilities suffice.'
  },
  {
    id: 'guard-no-layout-shifts',
    label: '❌ Zero Layout Shifts (CLS)',
    category: 'guardrails',
    snippet: '- DO NOT cause cumulative layout shifts or hydration mismatches; ensure smooth layout stability.'
  },
  {
    id: 'guard-skills-enforced',
    label: '⚡ Enforce skills.sh at Every Step',
    category: 'guardrails',
    snippet: '- MANDATORY SKILL USAGE: DO NOT guess architectural patterns or implement ad-hoc styling; you MUST consult and adhere to relevant Agent Skills (from skills.sh or .agents/skills/) at every development step.'
  }
];

export const SELECTABLE_WORKFLOW_PRESETS: SelectableBoilerplateOption[] = [
  {
    id: 'wf-phased',
    label: 'Skills-Driven Phased: Skills Ingestion → Plan → Implement → Verify',
    category: 'workflow',
    snippet: '1. Skills Discovery & Ingestion: Inspect .agents/skills/ and skills.sh to equip relevant domain skills before starting.\n2. Modular Architecture Plan: Formulate implementation steps strictly adhering to loaded skill patterns.\n3. Implementation: Author complete drop-in source code conforming to design systems and performance standards.\n4. Local Persistence & State: Connect verified storage with zero regressions.\n5. Automated Verification: Run unit tests and production build verification commands.'
  },
  {
    id: 'wf-tdd',
    label: 'Test-Driven: Unit Test Specs → Core Logic → Benchmark',
    category: 'workflow',
    snippet: '1. Author failing automated test cases defining expected behavior.\n2. Implement minimal passing business logic.\n3. Refactor with strict TypeScript types.\n4. Verify tests pass and run benchmarks.'
  },
  {
    id: 'wf-surgical',
    label: 'Surgical Fix: Root Cause Hypothesis → Minimal Diff → Verify',
    category: 'workflow',
    snippet: '1. Analyze stack trace, logs, and lifecycle timing.\n2. Formulate 3 ranked hypotheses (High, Medium, Low).\n3. Isolate root cause with targeted testing.\n4. Provide minimal, regression-free code patch.\n5. Verify reproduction test passes.'
  },
  {
    id: 'wf-refurbish',
    label: 'Production Refurbishment: Purge Bloat → Rebuild Core → Verify',
    category: 'workflow',
    snippet: '1. Audit repository and strip out-of-scope code.\n2. Preserve reusable design tokens and utilities.\n3. Rebuild core user workflows cleanly.\n4. Validate 100% responsive design and production build.'
  }
];

export const SELECTABLE_TESTING_CHIPS: SelectableBoilerplateOption[] = [
  { id: 'test-ts', label: 'Zero TypeScript Compiler Errors', category: 'testing', snippet: '- [ ] Zero TypeScript compiler errors with strict mode enabled.' },
  { id: 'test-responsive', label: '100% Responsive (320px to 4K)', category: 'testing', snippet: '- [ ] 100% responsive across all viewport widths (320px mobile to 4K desktop) without horizontal scrollbar.' },
  { id: 'test-unit', label: 'Automated Unit Tests Passing', category: 'testing', snippet: '- [ ] Automated unit test suites execute and pass cleanly.' },
  { id: 'test-offline', label: 'Offline IndexedDB Persistence Working', category: 'testing', snippet: '- [ ] Offline persistence works reliably with schema validation and fallback.' },
  { id: 'test-a11y', label: 'WCAG 2.1 AA Keyboard Accessible', category: 'testing', snippet: '- [ ] WCAG 2.1 AA accessibility compliant with visible keyboard focus indicators.' },
  { id: 'test-build', label: 'Production Build Succeeds Cleanly', category: 'testing', snippet: '- [ ] Production build succeeds with 0 errors or warnings.' }
];

export const SELECTABLE_ARCHITECTURE_CHIPS: SelectableBoilerplateOption[] = [
  { id: 'arch-modular', label: 'Clean Modular Architecture', category: 'architecture', snippet: 'Follow clean modular architecture: separate UI presentation from business logic and data persistence.' },
  { id: 'arch-offline', label: 'Offline-First Local Storage', category: 'architecture', snippet: 'Implement browser IndexedDB for local application data with schema versioning and JSON export/import.' },
  { id: 'arch-rsc', label: 'Strict Server / Client Component Boundary', category: 'architecture', snippet: 'Maintain strict boundaries: use React Server Components for structure and Client Components only for interactivity.' },
  { id: 'arch-performance', label: 'Sub-100ms Latency & No Layout Shift', category: 'architecture', snippet: 'Optimize for perceived and actual performance: sub-100ms interaction latency and zero layout shifts.' }
];

export const SELECTABLE_SKILL_CHIPS: SelectableBoilerplateOption[] = [
  {
    id: 'skill-skills-sh',
    label: '⚡ skills.sh Universal Protocol',
    category: 'skill',
    snippet: '- skills.sh Standard: At every step of development, verify and invoke specialized domain skills from skills.sh (or local .agents/skills/) before authoring or modifying code.'
  },
  {
    id: 'skill-ui-ux-pro-max',
    label: '🎨 UI/UX Pro Max (Design Systems)',
    category: 'skill',
    snippet: '- ui-ux-pro-max Skill: Consult UI/UX design intelligence at each step: implement semantic color tokens, fluid responsive layout, WCAG AA contrast, and sleek micro-interactions.'
  },
  {
    id: 'skill-vercel-react',
    label: '🚀 Vercel React Best Practices',
    category: 'skill',
    snippet: '- vercel-react-best-practices Skill: Adhere strictly to Next.js App Router and React 19 performance patterns: Server Components by default, minimal client boundaries, zero unnecessary re-renders, and fast page loads.'
  },
  {
    id: 'skill-neon-postgres',
    label: '🐘 Neon Lakebase Postgres Skill',
    category: 'skill',
    snippet: '- Neon Postgres Skill: Adhere to Lakebase Postgres best practices: pooled connections for serverless, direct connections for migrations, schema branching, and @neondatabase/serverless driver.'
  },
  {
    id: 'skill-antigravity',
    label: '🤖 Antigravity Agentic Directives',
    category: 'skill',
    snippet: '- Google Antigravity Skill: Leverage advanced agentic coding protocols: consult SKILL.md before execution, run background verification tasks, manage subagents, and preserve context across sessions.'
  },
  {
    id: 'skill-clean-arch',
    label: '🏛️ Clean Architecture & TDD',
    category: 'skill',
    snippet: '- Clean Architecture Skill: Enforce strict separation of concerns: decouple domain entities from UI components and storage adapters, accompanied by automated unit tests.'
  },
  {
    id: 'skill-offline-idb',
    label: '💾 Offline-First IndexedDB Skill',
    category: 'skill',
    snippet: '- Local-First Storage Skill: Use resilient browser IndexedDB with versioned schemas, real-time cross-tab broadcast synchronization, and zero server telemetry.'
  }
];

