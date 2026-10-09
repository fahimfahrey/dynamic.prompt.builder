import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Test string interpolation logic
function interpolateVariables(templateString, variables) {
  let result = templateString;
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

function extractVariablesFromText(text) {
  const vars = new Set();
  const doubleMustacheRegex = /{{\s*([a-zA-Z0-9_-]+)\s*}}/g;
  let match;
  while ((match = doubleMustacheRegex.exec(text)) !== null) {
    vars.add(match[1]);
  }
  return Array.from(vars);
}

function estimateTokenCount(text) {
  if (!text) return 0;
  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).length;
  const charCount = trimmed.length;
  return Math.max(1, Math.ceil((charCount / 3.8 + wordCount * 1.25) / 2));
}

describe('Prompt Engine & Compiler Logic', () => {
  test('extracts variable names from double-mustache patterns', () => {
    const raw = 'Hello {{user_name}}, please review the code in {{repo_name}} for {{task}}.';
    const extracted = extractVariablesFromText(raw);
    assert.deepEqual(extracted, ['user_name', 'repo_name', 'task']);
  });

  test('correctly interpolates variables into templates', () => {
    const template = 'Task: {{task}}\nTech: {{tech}}\nGoal: [GOAL]';
    const values = {
      task: 'Build Auth System',
      tech: 'Next.js & IndexedDB',
      goal: 'Zero security regressions'
    };
    const interpolated = interpolateVariables(template, values);
    assert.match(interpolated, /Task: Build Auth System/);
    assert.match(interpolated, /Tech: Next\.js & IndexedDB/);
    assert.match(interpolated, /Goal: Zero security regressions/);
  });

  test('estimates tokens realistically', () => {
    const sample = 'You are a Senior Staff Engineer. Write a secure authentication handler in Next.js.';
    const tokens = estimateTokenCount(sample);
    assert.ok(tokens > 10 && tokens < 50, `Tokens was ${tokens}, expected between 10 and 50`);
  });
});
