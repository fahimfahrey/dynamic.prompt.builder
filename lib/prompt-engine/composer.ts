import {
  PromptSection,
  OutputFormat,
  PromptStats,
  PromptQualityReport,
  QualityCheckRule
} from '../types';

/**
 * Transforms section key or title into clean XML tag name (e.g. ROLE AND EXPERTISE -> role_and_expertise)
 */
function sanitizeXmlTag(title: string, key?: string): string {
  const base = key || title;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Deterministically composes structured sections into a formatted prompt string
 */
export function composePrompt(
  sections: PromptSection[],
  format: OutputFormat = 'markdown'
): string {
  // Sort sections by their defined order
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  // Filter out disabled sections and empty content
  const activeSections = sorted.filter(
    (s) => s.enabled && s.content && s.content.trim().length > 0
  );

  if (activeSections.length === 0) {
    return '';
  }

  if (format === 'xml') {
    return activeSections
      .map((s) => {
        const tagName = sanitizeXmlTag(s.title, s.key);
        return `<${tagName}>\n${s.content.trim()}\n</${tagName}>`;
      })
      .join('\n\n');
  }

  if (format === 'plain') {
    return activeSections
      .map((s) => `--- ${s.title.toUpperCase().trim()} ---\n${s.content.trim()}`)
      .join('\n\n');
  }

  // Default: Markdown
  return activeSections
    .map((s) => {
      const heading = s.title.toUpperCase().trim();
      return `## ${heading}\n\n${s.content.trim()}`;
    })
    .join('\n\n');
}

/**
 * Estimates token count based on industry character/word ratio
 */
export function estimateTokenCount(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const charCount = trimmed.length;
  // Blend word and char heuristic for accuracy across code and prose
  const tokenEstimate = Math.ceil((charCount / 3.8 + wordCount * 1.25) / 2);
  return Math.max(1, tokenEstimate);
}

/**
 * Calculates complete statistics for a prompt
 */
export function calculatePromptStats(
  text: string,
  sections: PromptSection[] = []
): PromptStats {
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;
  const sectionCount = sections.length;
  const activeSectionCount = sections.filter(
    (s) => s.enabled && s.content && s.content.trim().length > 0
  ).length;
  const estimatedTokens = estimateTokenCount(text);

  return {
    wordCount,
    charCount,
    sectionCount,
    activeSectionCount,
    estimatedTokens
  };
}

/**
 * Rule-based, transparent prompt quality evaluation
 */
export function auditPromptQuality(
  sections: PromptSection[],
  composedText: string
): PromptQualityReport {
  const rules: QualityCheckRule[] = [];
  const suggestions: string[] = [];
  const textLower = composedText.toLowerCase();

  // Find sections by key
  const getSection = (k: string) => sections.find((s) => s.key === k && s.enabled && s.content.trim().length > 0);

  // 1. Objective Defined
  const objectiveSec = getSection('objective');
  const hasObjective = !!objectiveSec || textLower.includes('objective') || textLower.includes('goal');
  rules.push({
    id: 'objective',
    label: 'Primary Objective Defined',
    passed: hasObjective,
    impact: 'critical',
    weight: 20,
    feedback: hasObjective
      ? 'Clear objective provides unambiguous direction to the AI.'
      : 'Objective is missing or empty. The AI will lack focus on the core task.',
    tip: 'Enable the "Objective" section and specify the exact outcome desired.'
  });
  if (!hasObjective) suggestions.push('Define a clear, single-sentence primary objective.');

  // 2. Role & Persona Specified
  const roleSec = getSection('role');
  const hasRole = !!roleSec || textLower.includes('act as') || textLower.includes('you are');
  rules.push({
    id: 'role',
    label: 'Role & Persona Specification',
    passed: hasRole,
    impact: 'high',
    weight: 15,
    feedback: hasRole
      ? 'Role anchors the model to senior engineering authority.'
      : 'No role specified. Default AI tone can be generic or timid.',
    tip: 'Define an authoritative persona (e.g. "Senior Software Architect").'
  });
  if (!hasRole) suggestions.push('Add a Role section specifying the expected technical seniority.');

  // 3. Technology Stack Bounded
  const techSec = getSection('tech_stack');
  const hasTech = !!techSec || textLower.includes('stack') || textLower.includes('framework') || textLower.includes('typescript');
  rules.push({
    id: 'tech_stack',
    label: 'Technology Stack Explicitly Bounded',
    passed: hasTech,
    impact: 'high',
    weight: 15,
    feedback: hasTech
      ? 'Explicit tech stack prevents unwanted libraries or conflicting versions.'
      : 'Technology stack is ambiguous. The AI might introduce incompatible packages.',
    tip: 'List explicit frameworks, languages, and tools (e.g. Next.js App Router, TypeScript).'
  });
  if (!hasTech) suggestions.push('Specify the exact frameworks and styling tools in the Tech Stack section.');

  // 4. Negative Constraints & Guardrails
  const constraintsSec = getSection('constraints_exclusions');
  const hasNegativeWords =
    textLower.includes('do not') ||
    textLower.includes('never') ||
    textLower.includes('avoid') ||
    textLower.includes('no placeholder');
  const hasConstraints = (!!constraintsSec && constraintsSec.content.length > 15) || hasNegativeWords;
  rules.push({
    id: 'constraints',
    label: 'Negative Constraints & Guardrails',
    passed: hasConstraints,
    impact: 'high',
    weight: 15,
    feedback: hasConstraints
      ? 'Negative constraints effectively prevent hallucinations and unwanted shortcuts.'
      : 'Missing negative constraints. Models tend to emit placeholders (TODOs) or over-engineer.',
    tip: 'Explicitly specify what NOT to do (e.g. "DO NOT use placeholders", "DO NOT add external APIs").'
  });
  if (!hasConstraints) suggestions.push('Add negative constraints (DO NOT do X) to avoid lazy boilerplate.');

  // 5. Implementation Workflow
  const workflowSec = getSection('implementation_workflow');
  const hasWorkflow = !!workflowSec || textLower.includes('workflow') || textLower.includes('step 1');
  rules.push({
    id: 'workflow',
    label: 'Implementation Workflow Specified',
    passed: hasWorkflow,
    impact: 'medium',
    weight: 15,
    feedback: hasWorkflow
      ? 'Workflow guides the agent through disciplined, test-first phases.'
      : 'No step-by-step workflow defined. The agent may rush into code without inspection.',
    tip: 'Instruct the agent to inspect before editing and verify before finishing.'
  });
  if (!hasWorkflow) suggestions.push('Include a phased workflow (Inspect → Plan → Implement → Verify).');

  // 6. Acceptance Criteria / Testing Strategy
  const criteriaSec = getSection('acceptance_criteria');
  const testSec = getSection('testing_strategy');
  const hasVerification = !!criteriaSec || !!testSec || textLower.includes('acceptance criteria') || textLower.includes('test');
  rules.push({
    id: 'verification',
    label: 'Testing & Acceptance Criteria',
    passed: hasVerification,
    impact: 'medium',
    weight: 10,
    feedback: hasVerification
      ? 'Explicit acceptance checklist establishes a measurable definition of done.'
      : 'No acceptance criteria or testing strategy provided.',
    tip: 'Add checkbox items or test verification commands.'
  });
  if (!hasVerification) suggestions.push('Add an Acceptance Criteria checklist to verify completion.');

  // 7. No Empty Enabled Sections
  const emptyEnabledSections = sections.filter((s) => s.enabled && (!s.content || s.content.trim().length === 0));
  const noEmptySections = emptyEnabledSections.length === 0;
  rules.push({
    id: 'cleanliness',
    label: 'All Active Sections Have Content',
    passed: noEmptySections,
    impact: 'low',
    weight: 10,
    feedback: noEmptySections
      ? 'All enabled sections contain meaningful content.'
      : `${emptyEnabledSections.length} enabled section(s) are blank.`,
    tip: 'Fill in blank sections or disable them to keep the prompt clean.'
  });
  if (!noEmptySections) suggestions.push('Fill or disable any empty sections.');

  // Calculate Weighted Score
  let totalScore = 0;
  for (const r of rules) {
    if (r.passed) totalScore += r.weight;
  }

  let grade: PromptQualityReport['grade'] = 'Incomplete';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 55) grade = 'C';

  return {
    score: totalScore,
    grade,
    rules,
    suggestions
  };
}
