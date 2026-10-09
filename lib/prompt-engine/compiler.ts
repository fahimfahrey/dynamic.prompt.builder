import {
  TargetModel,
  PromptEvaluationReport,
  PromptEvaluationCriterion
} from '../types';
import { TARGET_MODELS } from '../data/default-templates';

/**
 * Extracts all variable names like {{var_name}}, {var_name}, or [VAR_NAME]
 */
export function extractVariablesFromText(text: string): string[] {
  const vars = new Set<string>();

  // {{var_name}}
  const doubleMustacheRegex = /{{\s*([a-zA-Z0-9_-]+)\s*}}/g;
  let match;
  while ((match = doubleMustacheRegex.exec(text)) !== null) {
    vars.add(match[1]);
  }

  // [VAR_NAME] (capitalized placeholders)
  const bracketRegex = /\[([A-Z0-9_]{2,})\]/g;
  while ((match = bracketRegex.exec(text)) !== null) {
    vars.add(match[1].toLowerCase());
  }

  return Array.from(vars);
}

/**
 * Replaces variables in a string with their provided values
 */
export function interpolateVariables(
  templateString: string,
  variables: Record<string, string>
): string {
  let result = templateString;

  // Replace {{var}}
  for (const [key, val] of Object.entries(variables)) {
    const escapedKey = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const doubleRegex = new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'gi');
    result = result.replace(doubleRegex, val || `[${key}]`);

    const singleRegex = new RegExp(`{${escapedKey}}`, 'g');
    result = result.replace(singleRegex, val || `[${key}]`);

    const bracketRegex = new RegExp(`\\[${escapedKey.toUpperCase()}\\]`, 'g');
    result = result.replace(bracketRegex, val || `[${key}]`);
  }

  return result;
}

/**
 * Estimates token count based on industry character/word ratio
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Code and structured XML/markdown averages ~3.6 - 4.0 chars per token
  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).length;
  const charCount = trimmed.length;
  // Blend word and char heuristic for accuracy
  const tokenEstimate = Math.ceil((charCount / 3.8 + wordCount * 1.25) / 2);
  return Math.max(1, tokenEstimate);
}

/**
 * Calculates estimated cost based on model and token count
 */
export function estimateCost(tokens: number, modelId: TargetModel): number {
  const model = TARGET_MODELS.find((m) => m.id === modelId) || TARGET_MODELS[0];
  const inputCost = (tokens / 1_000_000) * model.inputCostPer1M;
  // Estimate ~500 output tokens average for typical code completion
  const outputCost = (500 / 1_000_000) * model.outputCostPer1M;
  return Number((inputCost + outputCost).toFixed(5));
}

/**
 * Evaluates the quality of any arbitrary prompt using engineering heuristics
 */
export function evaluatePromptQuality(rawPrompt: string): PromptEvaluationReport {
  const criteria: PromptEvaluationCriterion[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const text = rawPrompt.toLowerCase();

  // 1. Role & Persona Definition
  const hasRole =
    text.includes('you are') ||
    text.includes('act as') ||
    text.includes('role:') ||
    text.includes('<role');
  criteria.push({
    id: 'role',
    name: 'Role & Persona Specification',
    score: hasRole ? 100 : 25,
    passed: hasRole,
    feedback: hasRole
      ? 'Clear persona/role defined to anchor the LLM behavior.'
      : 'No explicit role or persona found.',
    suggestion: hasRole
      ? 'Good job. Keep role boundaries focused.'
      : 'Add an opening line like: "You are an elite Senior Staff Engineer..." to calibrate model tone.'
  });
  if (hasRole) strengths.push('Defines clear authoritative persona.');
  else weaknesses.push('Missing explicit role specification.');

  // 2. Clear Delimiters (XML, Markdown, Code Fences)
  const hasXml = /<[a-z_]+>.*<\/[a-z_]+>/s.test(rawPrompt);
  const hasMarkdownHeadings = /#{1,3}\s+[A-Za-z]/.test(rawPrompt);
  const hasDelimiters = hasXml || hasMarkdownHeadings;
  criteria.push({
    id: 'delimiters',
    name: 'Structural Delimiters (XML / Markdown)',
    score: hasXml ? 100 : hasMarkdownHeadings ? 85 : 30,
    passed: hasDelimiters,
    feedback: hasXml
      ? 'Excellent XML tag delimiters separating context, rules, and input.'
      : hasMarkdownHeadings
      ? 'Good Markdown heading hierarchy used.'
      : 'Prompt lacks clear section delimiters, which may cause context leakage.',
    suggestion: 'Use XML tags like <context>...</context> and <instructions>...</instructions> for best prompt isolation.'
  });
  if (hasDelimiters) strengths.push('Strong structural separation between sections.');
  else weaknesses.push('Lacks clear boundaries between instructions and inputs.');

  // 3. Negative Constraints & Guardrails
  const hasNegativeConstraints =
    text.includes('never') ||
    text.includes('do not') ||
    text.includes("don't") ||
    text.includes('avoid') ||
    text.includes('prohibited');
  criteria.push({
    id: 'constraints',
    name: 'Negative Constraints & Guardrails',
    score: hasNegativeConstraints ? 95 : 35,
    passed: hasNegativeConstraints,
    feedback: hasNegativeConstraints
      ? 'Explicit guardrails present to prevent common LLM pitfalls.'
      : 'No negative constraints found. The model might hallucinate or include placeholders.',
    suggestion: 'Explicitly specify what NOT to do (e.g. "Do not use TODO placeholders, avoid deprecated libraries").'
  });
  if (hasNegativeConstraints) strengths.push('Includes guardrails against hallucinations.');
  else weaknesses.push('Missing negative constraints ("DO NOT do X").');

  // 4. Output Format Specification
  const hasOutputSpec =
    text.includes('output format') ||
    text.includes('respond with') ||
    text.includes('json') ||
    text.includes('markdown') ||
    text.includes('table') ||
    text.includes('schema');
  criteria.push({
    id: 'output_format',
    name: 'Explicit Output Format Specification',
    score: hasOutputSpec ? 100 : 40,
    passed: hasOutputSpec,
    feedback: hasOutputSpec
      ? 'Specifies the expected response structure.'
      : 'Output structure is ambiguous.',
    suggestion: 'State whether you expect a JSON object, markdown table, or complete runnable file.'
  });
  if (hasOutputSpec) strengths.push('Explicit output format constraints.');
  else weaknesses.push('Output format not tightly specified.');

  // 5. Reasoning / Thinking Directive
  const hasReasoning =
    text.includes('step-by-step') ||
    text.includes('think') ||
    text.includes('reasoning') ||
    text.includes('first plan') ||
    text.includes('<thinking');
  criteria.push({
    id: 'reasoning',
    name: 'Chain-of-Thought / Reasoning Directives',
    score: hasReasoning ? 100 : 45,
    passed: hasReasoning,
    feedback: hasReasoning
      ? 'Forces model to reason and verify before delivering answer.'
      : 'Prompt does not encourage chain-of-thought or reasoning.',
    suggestion: 'Ask the model to explain its plan or use <thinking> tags before producing code.'
  });
  if (hasReasoning) strengths.push('Instructs model to reason systematically.');
  else weaknesses.push('Does not mandate step-by-step planning.');

  // 6. Parameterization & Reusability
  const hasVariables =
    /{{\s*[a-zA-Z0-9_-]+\s*}}/.test(rawPrompt) ||
    /\[[A-Z0-9_]{2,}\]/.test(rawPrompt);
  criteria.push({
    id: 'reusability',
    name: 'Variable Parameterization',
    score: hasVariables ? 100 : 50,
    passed: hasVariables,
    feedback: hasVariables
      ? 'Uses reusable parameters (e.g. {{variable}}).'
      : 'Hardcoded content without variable placeholders.',
    suggestion: 'Wrap dynamic user inputs in {{variable_name}} for clean reuse.'
  });

  // Calculate Overall Score
  const totalScore = Math.round(
    criteria.reduce((acc, c) => acc + c.score, 0) / criteria.length
  );

  let grade: PromptEvaluationReport['grade'] = 'Needs Improvement';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 60) grade = 'C';

  // Construct auto-improved prompt suggestion
  const improvedVersion = `<system_prompt>
<role>
You are an expert Senior Staff Software Engineer and Autonomous AI Coding Agent (Google Antigravity & Claude Code Standard).
</role>

<agent_skills_protocol>
Mandatory: At every development step, verify and invoke specialized domain skills from skills.sh (or local .agents/skills/):
- Consult SKILL.md before writing code or modifying existing architecture.
- Enforce battle-tested domain guidelines (UI/UX design systems, Vercel React best practices, clean architecture).
</agent_skills_protocol>

<instructions>
1. Inspect the codebase and active skills before touching any files.
2. Formulate a skills-driven phased plan (Skills Ingestion → Plan → Implement → Verify).
3. Provide complete, production-ready, type-safe implementation with zero placeholders.
4. Execute automated tests and verify build cleanly passes.
</instructions>

<rules>
- DO NOT use lazy placeholder comments, truncated snippets, or "TODO" omissions.
- DO NOT bypass skills.sh protocols or ignore loaded skill instructions.
- Include explicit error handling and defensive type assertions.
- Prioritize high accessibility (WCAG AA), responsive design, and low cognitive load.
</rules>

<reasoning_directive>
Execute disciplined phased reasoning (Skills Ingestion → Plan → Implement → Verify) before providing final code.
</reasoning_directive>
</system_prompt>

<user_prompt>
${rawPrompt.trim()}
</user_prompt>`;

  return {
    overallScore: totalScore,
    grade,
    summary:
      totalScore >= 85
        ? 'High quality prompt with strong role definition, delimiters, and guardrails.'
        : totalScore >= 70
        ? 'Solid prompt with minor gaps in output specification or negative constraints.'
        : 'Needs significant improvement: lacks structural delimiters, explicit role, or guardrails.',
    criteria,
    strengths,
    weaknesses,
    improvedVersion
  };
}
