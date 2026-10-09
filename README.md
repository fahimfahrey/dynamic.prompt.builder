# PromptForge — AI Prompt Builder & Meta-Prompting Studio

**PromptForge** is a production-grade, client-side Prompt Engineering and Meta-Prompting Workspace built with Next.js App Router, React 19, TypeScript, and IndexedDB.

It is designed for software developers, technical architects, and engineering teams crafting high-fidelity prompts for modern AI coding agents (Cursor, Windsurf, Claude Code, Cline, Aider) and frontier reasoning models (Claude 3.7 Sonnet, GPT-4.5, Gemini 2.0 Pro, DeepSeek R1).

---

## 🚀 Key Features

### 1. 22 Structured Prompt Sections
Instead of relying on an unstructured wall of text, prompts are constructed from reorderable, toggleable, and editable sections:
- **Role & Expertise**: Calibrates technical seniority and persona authority.
- **Project Context & Existing State**: Grounds the model in real repository conditions.
- **Objective**: Pinpoints the single primary goal.
- **Functional & Non-Functional Requirements**: Detailed feature specs and latency budgets.
- **Technology Stack**: Explicit frameworks, versions, and restrictions.
- **Architecture Requirements**: Modular boundaries and system designs.
- **Negative Constraints & Exclusions**: Critical guardrails (`DO NOT use placeholders`, `NEVER add unnecessary APIs`).
- **Implementation Workflow**: Phased execution instructions (Inspect → Plan → Implement → Verify).
- **Acceptance Criteria Checklist**: Actionable definition of done.
- **Deliverables & Final Directives**: Concrete code output expectations.
- **Custom Sections**: Add, reorder, duplicate, or delete custom sections at any time.

### 2. Dual Authoring Modes
- **Direct Modular Builder**: Stacked section cards with up/down reordering, enable/mute toggles, duplication, and live word/character counts.
- **Guided Configuration Wizard**: A 5-step workflow (Task Definition → Environment & Stack → Requirements & Guardrails → Agent Behavior → Review & Build).
- **Raw Override Mode**: Edit generated prompt text directly with protection against accidental overwrites.

### 3. Transparent Prompt Quality Auditor
Rule-based, deterministic quality evaluator that scores prompts (0–100) and assigns a letter grade (`A+`, `A`, `B`, `C`, `Incomplete`) with actionable tips:
- Objective defined?
- Role and persona specified?
- Technology stack bounded?
- Negative constraints and guardrails included?
- Phased workflow protocol defined?
- Acceptance criteria and verification checklist present?
- Cleanliness (all enabled sections populated).

### 4. Deterministic Multi-Format Compiler
- **Markdown**: Formatted with clear `## SECTION` headings.
- **XML Tags**: Anthropic-optimized `<section_name>` delimiters preventing context leakage.
- **Plain Text**: Standard portable text boundaries.
- **Live Metrics**: Real-time Word count, Character count, and estimated Token count.

### 5. Offline-First IndexedDB Persistence
- **Saved Library (`/library`)**: Search, filter by category, favorite, duplicate, delete, and sort saved prompts.
- **Templates Catalog (`/templates`)**: Production blueprints for application building, codebase refurbishment, bug fixing, design systems, and architecture specs.
- **Full JSON Backup & Restore (`/settings`)**: Export your entire prompt collection or restore from backup with schema validation. Zero external backend or server database required.

---

## 🛠️ Application Route Map

- `/` — Main Prompt Builder Workspace (3-region IDE: Library Sidebar + Section Builder / Wizard + Live Output & Quality Auditor).
- `/library` — Saved Prompt Library with search, category filtering, favorites, and backup tools.
- `/templates` — Engineering Blueprints Catalog with one-click "Load into Studio".
- `/optimizer` — Standalone Heuristic Quality Auditor for testing and improving arbitrary prompts.
- `/guide` — Meta-Prompting and AI Coding Agent Architecture Reference Manual.
- `/settings` — Workspace formatting defaults, dark/light theme, and IndexedDB backup management.
- `/sitemap.xml` & `/robots.txt` — Dynamic SEO and crawler indexing routes.

---

## 🧪 Testing & Verification

```bash
# Run unit tests (Compiler, XML structuring, Token heuristics, Quality audit)
npm test

# Run TypeScript checks and production build
npm run build

# Start production server
npm start
```
