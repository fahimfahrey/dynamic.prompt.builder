export type OutputFormat = 'markdown' | 'xml' | 'plain';

export type TargetModel =
  | 'antigravity'
  | 'claude-3-7-sonnet'
  | 'gpt-4-5'
  | 'gemini-2-pro'
  | 'deepseek-r1'
  | 'universal';

export interface TargetModelSpec {
  id: TargetModel;
  name: string;
  provider: string;
  contextWindow: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  bestFor: string;
  strengths: string[];
}

export interface PromptEvaluationCriterion {
  id: string;
  name: string;
  score: number;
  passed: boolean;
  feedback: string;
  suggestion: string;
}

export interface PromptEvaluationReport {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Improvement';
  summary: string;
  criteria: PromptEvaluationCriterion[];
  strengths: string[];
  weaknesses: string[];
  improvedVersion: string;
}

export interface PromptSection {
  id: string;
  key: string;
  title: string;
  content: string;
  enabled: boolean;
  isCustom?: boolean;
  order: number;
}

export interface StructuredPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  targetModel: TargetModel;
  outputFormat: OutputFormat;
  sections: PromptSection[];
  rawPromptOverride?: string;
  isManuallyEdited: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PromptTemplate {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  sections: Array<{
    key: string;
    title: string;
    content: string;
    enabled: boolean;
    isCustom?: boolean;
    order: number;
  }>;
  targetModel: TargetModel;
  outputFormat: OutputFormat;
  isBuiltIn: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PromptCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
}

export interface QualityCheckRule {
  id: string;
  label: string;
  passed: boolean;
  impact: 'critical' | 'high' | 'medium' | 'low';
  weight: number;
  feedback: string;
  tip: string;
}

export interface PromptQualityReport {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'Incomplete';
  rules: QualityCheckRule[];
  suggestions: string[];
}

export interface WorkspaceSettings {
  theme: 'dark' | 'light';
  defaultOutputFormat: OutputFormat;
  defaultTargetModel: TargetModel;
  autoSave: boolean;
  showQualityPanel: boolean;
}

export interface PromptStats {
  wordCount: number;
  charCount: number;
  sectionCount: number;
  activeSectionCount: number;
  estimatedTokens: number;
}
