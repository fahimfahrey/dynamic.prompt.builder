import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

function evaluatePromptQuality(rawPrompt) {
  const criteria = [];
  const text = rawPrompt.toLowerCase();

  const hasRole =
    text.includes('you are') ||
    text.includes('act as') ||
    text.includes('role:') ||
    text.includes('<role');
  criteria.push({ id: 'role', score: hasRole ? 100 : 25, passed: hasRole });

  const hasXml = /<[a-z_]+>.*<\/[a-z_]+>/s.test(rawPrompt);
  const hasMarkdown = /#{1,3}\s+[A-Za-z]/.test(rawPrompt);
  const hasDelimiters = hasXml || hasMarkdown;
  criteria.push({ id: 'delimiters', score: hasXml ? 100 : hasMarkdown ? 85 : 30, passed: hasDelimiters });

  const hasNegativeConstraints =
    text.includes('never') ||
    text.includes('do not') ||
    text.includes("don't") ||
    text.includes('avoid');
  criteria.push({ id: 'constraints', score: hasNegativeConstraints ? 95 : 35, passed: hasNegativeConstraints });

  const totalScore = Math.round(
    criteria.reduce((acc, c) => acc + c.score, 0) / criteria.length
  );

  return { totalScore, criteria };
}

describe('Prompt Quality & Heuristic Evaluation Engine', () => {
  test('flags weak prompts lacking roles and delimiters', () => {
    const weak = 'Write a website in next.js';
    const evalResult = evaluatePromptQuality(weak);
    assert.ok(evalResult.totalScore < 50, `Score was ${evalResult.totalScore}, expected < 50`);
    assert.equal(evalResult.criteria.find(c => c.id === 'role').passed, false);
    assert.equal(evalResult.criteria.find(c => c.id === 'delimiters').passed, false);
  });

  test('awards high score to structured XML prompt with negative constraints', () => {
    const strong = `<system_prompt>
<role>You are a Senior Staff Engineer.</role>
<rules>Never use TODO placeholders or incomplete code. Do not expose secrets.</rules>
</system_prompt>
<user_prompt>Build authentication handler.</user_prompt>`;

    const evalResult = evaluatePromptQuality(strong);
    assert.ok(evalResult.totalScore >= 90, `Score was ${evalResult.totalScore}, expected >= 90`);
    assert.equal(evalResult.criteria.find(c => c.id === 'role').passed, true);
    assert.equal(evalResult.criteria.find(c => c.id === 'delimiters').passed, true);
    assert.equal(evalResult.criteria.find(c => c.id === 'constraints').passed, true);
  });
});
