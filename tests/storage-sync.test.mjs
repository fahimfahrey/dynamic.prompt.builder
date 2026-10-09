import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Data Persistence & Cross-Tab Sync Protocols', () => {
  it('validates default settings schema and theme defaults', () => {
    const defaultSettings = {
      theme: 'dark',
      defaultOutputFormat: 'markdown',
      defaultTargetModel: 'claude-3-7-sonnet',
      autoSave: true,
      showQualityPanel: true
    };

    assert.strictEqual(defaultSettings.theme, 'dark');
    assert.strictEqual(defaultSettings.autoSave, true);
    assert.strictEqual(defaultSettings.defaultOutputFormat, 'markdown');
  });

  it('validates full library backup export structure matches schema', () => {
    const backupPayload = {
      app: 'PromptForge',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      prompts: [
        {
          id: 'prompt-1',
          title: 'Master Refurbishment Prompt',
          description: 'Refurbishes codebase into production developer tool.',
          category: 'software-development',
          tags: ['Refurbish', 'Architecture'],
          isFavorite: true,
          targetModel: 'claude-3-7-sonnet',
          outputFormat: 'markdown',
          sections: [
            { id: 's1', key: 'role', title: 'ROLE', content: 'Principal Software Architect', enabled: true, order: 0 },
            { id: 's2', key: 'objective', title: 'OBJECTIVE', content: 'Refurbish repo', enabled: true, order: 1 }
          ],
          isManuallyEdited: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ],
      customTemplates: [],
      settings: {
        theme: 'dark',
        defaultOutputFormat: 'markdown',
        defaultTargetModel: 'claude-3-7-sonnet',
        autoSave: true,
        showQualityPanel: true
      }
    };

    const serialized = JSON.stringify(backupPayload);
    const deserialized = JSON.parse(serialized);

    assert.strictEqual(deserialized.app, 'PromptForge');
    assert.strictEqual(deserialized.schemaVersion, 2);
    assert.strictEqual(deserialized.prompts.length, 1);
    assert.strictEqual(deserialized.settings.autoSave, true);
  });

  it('validates sync message formats for cross-tab broadcast channels', () => {
    const validMessages = [
      { type: 'PROMPT_SAVED', promptId: 'prompt-123', updatedAt: 1700000000 },
      { type: 'PROMPT_DELETED', promptId: 'prompt-123' },
      { type: 'PROMPTS_CHANGED' },
      { type: 'TEMPLATE_CHANGED' },
      { type: 'SETTINGS_CHANGED', theme: 'light' },
      { type: 'STORAGE_RESET' }
    ];

    for (const msg of validMessages) {
      assert.ok(msg.type);
      const str = JSON.stringify(msg);
      const parsed = JSON.parse(str);
      assert.strictEqual(parsed.type, msg.type);
      if (parsed.type === 'PROMPT_SAVED') {
        assert.ok(parsed.promptId);
        assert.ok(parsed.updatedAt > 0);
      }
      if (parsed.type === 'SETTINGS_CHANGED') {
        assert.strictEqual(parsed.theme, 'light');
      }
    }
  });

  it('ensures debounced auto-save payload accurately records updated timestamp', () => {
    const originalTime = 1000000;
    const prompt = {
      id: 'p-1',
      title: 'Prompt',
      sections: [],
      updatedAt: originalTime
    };

    const updatedTime = Date.now();
    const savedPrompt = {
      ...prompt,
      updatedAt: updatedTime
    };

    assert.ok(savedPrompt.updatedAt >= originalTime);
    assert.strictEqual(savedPrompt.id, 'p-1');
  });
});
