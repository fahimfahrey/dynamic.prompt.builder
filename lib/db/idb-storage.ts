import { openDB, IDBPDatabase } from 'idb';
import {
  StructuredPrompt,
  PromptTemplate,
  WorkspaceSettings,
  PromptSection
} from '../types';
import {
  BUILT_IN_TEMPLATES,
  DEFAULT_WORKSPACE_SETTINGS,
  STANDARD_SECTION_TEMPLATES
} from '../data/default-templates';

const DB_NAME = 'PromptForgeV2DB';
const DB_VERSION = 2;

interface PromptForgeDBSchema {
  prompts: {
    key: string;
    value: StructuredPrompt;
    indexes: { 'by-updated': number; 'by-category': string; 'by-favorite': number };
  };
  custom_templates: {
    key: string;
    value: PromptTemplate;
    indexes: { 'by-category': string; 'by-updated': number };
  };
  workspace_settings: {
    key: string;
    value: WorkspaceSettings;
  };
}

let dbPromise: Promise<IDBPDatabase<PromptForgeDBSchema>> | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

async function getDB(): Promise<IDBPDatabase<PromptForgeDBSchema> | null> {
  if (!isBrowser()) return null;

  if (!dbPromise) {
    dbPromise = openDB<PromptForgeDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('prompts')) {
          const promptStore = db.createObjectStore('prompts', { keyPath: 'id' });
          promptStore.createIndex('by-updated', 'updatedAt');
          promptStore.createIndex('by-category', 'category');
          promptStore.createIndex('by-favorite', 'isFavorite');
        }

        if (!db.objectStoreNames.contains('custom_templates')) {
          const tmplStore = db.createObjectStore('custom_templates', { keyPath: 'id' });
          tmplStore.createIndex('by-category', 'category');
          tmplStore.createIndex('by-updated', 'updatedAt');
        }

        if (!db.objectStoreNames.contains('workspace_settings')) {
          db.createObjectStore('workspace_settings');
        }
      }
    });
  }

  return dbPromise;
}

// In-memory fallback / SSR storage cache
let memoryPrompts: StructuredPrompt[] = [];
let memoryTemplates: PromptTemplate[] = [...BUILT_IN_TEMPLATES];
let memorySettings: WorkspaceSettings = { ...DEFAULT_WORKSPACE_SETTINGS };

// ==================== CROSS-TAB REAL-TIME SYNCHRONIZATION ====================

const SYNC_CHANNEL_NAME = 'promptforge_cross_tab_sync';
const ACTIVE_PROMPT_KEY = 'promptforge_active_prompt_id';

export type StorageSyncMessage =
  | { type: 'PROMPT_SAVED'; promptId: string; updatedAt: number }
  | { type: 'PROMPT_DELETED'; promptId: string }
  | { type: 'PROMPTS_CHANGED' }
  | { type: 'TEMPLATE_CHANGED' }
  | { type: 'SETTINGS_CHANGED'; theme?: 'light' | 'dark' }
  | { type: 'STORAGE_RESET' };

let channelInstance: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!channelInstance) {
    try {
      channelInstance = new BroadcastChannel(SYNC_CHANNEL_NAME);
    } catch {
      channelInstance = null;
    }
  }
  return channelInstance;
}

export function broadcastStorageSync(message: StorageSyncMessage): void {
  try {
    const ch = getBroadcastChannel();
    if (ch) {
      ch.postMessage(message);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('promptforge_local_sync', { detail: message }));
      try {
        localStorage.setItem('promptforge_last_sync_ping', JSON.stringify({ ...message, timestamp: Date.now() }));
      } catch {}
    }
  } catch (err) {
    console.warn('Cross-tab broadcast sync failed:', err);
  }
}

export function subscribeToStorageSync(
  callback: (msg: StorageSyncMessage) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const ch = getBroadcastChannel();
  const bcHandler = (event: MessageEvent<StorageSyncMessage>) => {
    callback(event.data);
  };

  const localHandler = (event: Event) => {
    const custom = event as CustomEvent<StorageSyncMessage>;
    if (custom.detail) callback(custom.detail);
  };

  const storageHandler = (event: StorageEvent) => {
    if (event.key === 'promptforge_last_sync_ping' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        callback(parsed);
      } catch {}
    }
  };

  if (ch) {
    ch.addEventListener('message', bcHandler);
  }
  window.addEventListener('promptforge_local_sync', localHandler);
  window.addEventListener('storage', storageHandler);

  return () => {
    if (ch) {
      ch.removeEventListener('message', bcHandler);
    }
    window.removeEventListener('promptforge_local_sync', localHandler);
    window.removeEventListener('storage', storageHandler);
  };
}

// Active prompt tracking in local browser state
export function getActivePromptId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACTIVE_PROMPT_KEY);
  } catch {
    return null;
  }
}

export function setActivePromptId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_PROMPT_KEY, id);
  } catch {}
}

// ==================== PROMPT CREATION & SEEDING ====================

export function createDefaultPrompt(title = 'Untitled Prompt', templateId?: string): StructuredPrompt {
  const tmpl = templateId ? BUILT_IN_TEMPLATES.find((t) => t.id === templateId) : null;

  const sections: PromptSection[] = tmpl
    ? tmpl.sections.map((s, idx) => ({
        id: `sec-${idx + 1}-${Math.random().toString(36).substr(2, 5)}`,
        key: s.key,
        title: s.title,
        content: s.content,
        enabled: s.enabled,
        order: s.order
      }))
    : STANDARD_SECTION_TEMPLATES.map((s, idx) => ({
        id: `sec-${idx + 1}-${Math.random().toString(36).substr(2, 5)}`,
        key: s.key,
        title: s.title,
        content: s.defaultContent,
        enabled: s.enabled,
        order: idx
      }));

  const newPrompt: StructuredPrompt = {
    id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: tmpl ? `${tmpl.title} (Draft)` : title,
    description: tmpl?.description || 'Custom developer prompt',
    category: tmpl?.category || 'software-development',
    tags: tmpl?.tags || ['Custom'],
    isFavorite: false,
    targetModel: tmpl?.targetModel || 'claude-3-7-sonnet',
    outputFormat: tmpl?.outputFormat || 'markdown',
    sections,
    isManuallyEdited: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  setActivePromptId(newPrompt.id);
  return newPrompt;
}

export async function initStorage(): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDB();
  if (!db) return;

  const count = await db.count('prompts');
  if (count === 0) {
    const tx = db.transaction('prompts', 'readwrite');
    for (const tmpl of BUILT_IN_TEMPLATES) {
      const prompt: StructuredPrompt = {
        id: `starter-${tmpl.id}`,
        title: tmpl.title,
        description: tmpl.description,
        category: tmpl.category,
        tags: tmpl.tags,
        isFavorite: tmpl.id === 'tmpl-refurbish-existing-app',
        targetModel: tmpl.targetModel,
        outputFormat: tmpl.outputFormat,
        sections: tmpl.sections.map((s, idx) => ({
          id: `sec-${idx + 1}-${Math.random().toString(36).substr(2, 5)}`,
          key: s.key,
          title: s.title,
          content: s.content,
          enabled: s.enabled,
          order: s.order
        })),
        isManuallyEdited: false,
        createdAt: tmpl.createdAt,
        updatedAt: tmpl.updatedAt
      };
      await tx.store.put(prompt);
    }
    await tx.done;
  }
}

// ==================== PROMPTS CRUD ====================

export async function getAllPrompts(): Promise<StructuredPrompt[]> {
  if (!isBrowser()) {
    if (memoryPrompts.length === 0) {
      memoryPrompts = BUILT_IN_TEMPLATES.map((t) => createDefaultPrompt(t.title, t.id));
    }
    return memoryPrompts;
  }

  try {
    const db = await getDB();
    if (!db) return memoryPrompts;
    const items = await db.getAll('prompts');
    if (items.length === 0) {
      await initStorage();
      return (await db.getAll('prompts')) || [];
    }
    return items.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error('Error fetching prompts from IDB:', err);
    return memoryPrompts;
  }
}

export async function getPromptById(id: string): Promise<StructuredPrompt | null> {
  if (!isBrowser()) {
    return memoryPrompts.find((p) => p.id === id) || null;
  }
  try {
    const db = await getDB();
    if (!db) return memoryPrompts.find((p) => p.id === id) || null;
    const prompt = await db.get('prompts', id);
    return prompt || null;
  } catch (err) {
    console.error(`Error fetching prompt ${id}:`, err);
    return null;
  }
}

export async function savePrompt(prompt: StructuredPrompt): Promise<StructuredPrompt> {
  const updated: StructuredPrompt = {
    ...prompt,
    updatedAt: Date.now()
  };

  if (!isBrowser()) {
    const idx = memoryPrompts.findIndex((p) => p.id === updated.id);
    if (idx >= 0) memoryPrompts[idx] = updated;
    else memoryPrompts.unshift(updated);
    return updated;
  }

  const db = await getDB();
  if (db) {
    await db.put('prompts', updated);
  }
  setActivePromptId(updated.id);
  broadcastStorageSync({ type: 'PROMPT_SAVED', promptId: updated.id, updatedAt: updated.updatedAt });
  return updated;
}

export async function deletePrompt(id: string): Promise<boolean> {
  if (!isBrowser()) {
    memoryPrompts = memoryPrompts.filter((p) => p.id !== id);
    return true;
  }
  const db = await getDB();
  if (db) {
    await db.delete('prompts', id);
    broadcastStorageSync({ type: 'PROMPT_DELETED', promptId: id });
    return true;
  }
  return false;
}

export async function duplicatePrompt(id: string): Promise<StructuredPrompt | null> {
  const original = await getPromptById(id);
  if (!original) return null;

  const copy: StructuredPrompt = {
    ...original,
    id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: `${original.title} (Copy)`,
    isFavorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sections: original.sections.map((s) => ({
      ...s,
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    }))
  };

  const saved = await savePrompt(copy);
  broadcastStorageSync({ type: 'PROMPTS_CHANGED' });
  return saved;
}

export async function toggleFavoritePrompt(id: string): Promise<boolean> {
  const prompt = await getPromptById(id);
  if (!prompt) return false;
  prompt.isFavorite = !prompt.isFavorite;
  await savePrompt(prompt);
  return prompt.isFavorite;
}

// ==================== TEMPLATES ====================

export async function getAllTemplates(): Promise<PromptTemplate[]> {
  if (!isBrowser()) return memoryTemplates;
  try {
    const db = await getDB();
    if (!db) return memoryTemplates;
    const customs = await db.getAll('custom_templates');
    return [...BUILT_IN_TEMPLATES, ...customs];
  } catch {
    return BUILT_IN_TEMPLATES;
  }
}

export async function saveCustomTemplate(tmpl: PromptTemplate): Promise<PromptTemplate> {
  tmpl.updatedAt = Date.now();
  if (!tmpl.id) {
    tmpl.id = `tmpl-custom-${Date.now()}`;
    tmpl.createdAt = Date.now();
  }
  tmpl.isBuiltIn = false;

  if (!isBrowser()) {
    memoryTemplates.push(tmpl);
    return tmpl;
  }

  const db = await getDB();
  if (db) {
    await db.put('custom_templates', tmpl);
  }
  broadcastStorageSync({ type: 'TEMPLATE_CHANGED' });
  return tmpl;
}

export async function deleteCustomTemplate(id: string): Promise<boolean> {
  if (!isBrowser()) {
    memoryTemplates = memoryTemplates.filter((t) => t.id !== id);
    return true;
  }
  const db = await getDB();
  if (db) {
    await db.delete('custom_templates', id);
    broadcastStorageSync({ type: 'TEMPLATE_CHANGED' });
    return true;
  }
  return false;
}

// ==================== SETTINGS ====================

export async function getWorkspaceSettings(): Promise<WorkspaceSettings> {
  if (!isBrowser()) return memorySettings;
  try {
    const db = await getDB();
    if (!db) return memorySettings;
    const s = await db.get('workspace_settings', 'user_settings');
    return s || DEFAULT_WORKSPACE_SETTINGS;
  } catch {
    return DEFAULT_WORKSPACE_SETTINGS;
  }
}

export async function saveWorkspaceSettings(settings: WorkspaceSettings): Promise<WorkspaceSettings> {
  memorySettings = { ...settings };
  if (!isBrowser()) return settings;
  const db = await getDB();
  if (db) {
    await db.put('workspace_settings', settings, 'user_settings');
  }
  broadcastStorageSync({ type: 'SETTINGS_CHANGED', theme: settings.theme });
  return settings;
}

// ==================== BACKUP & RESTORE ====================

export async function exportLibraryJson(): Promise<string> {
  const prompts = await getAllPrompts();
  const templates = await getAllTemplates();
  const settings = await getWorkspaceSettings();

  const backup = {
    app: 'PromptForge',
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    prompts,
    customTemplates: templates.filter((t) => !t.isBuiltIn),
    settings
  };

  return JSON.stringify(backup, null, 2);
}

export async function importLibraryJson(
  jsonString: string
): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.prompts || !Array.isArray(data.prompts)) {
      return { success: false, message: 'Invalid backup file: missing "prompts" array.' };
    }

    if (!isBrowser()) {
      return { success: true, message: 'Simulated import succeeded', count: data.prompts.length };
    }

    const db = await getDB();
    if (!db) return { success: false, message: 'IndexedDB unavailable.' };

    const tx = db.transaction('prompts', 'readwrite');
    let importedCount = 0;
    for (const p of data.prompts) {
      if (p.id && p.title && Array.isArray(p.sections)) {
        await tx.store.put(p);
        importedCount++;
      }
    }
    await tx.done;

    broadcastStorageSync({ type: 'STORAGE_RESET' });

    return {
      success: true,
      message: `Successfully imported ${importedCount} prompt(s).`,
      count: importedCount
    };
  } catch (err: any) {
    return { success: false, message: `Import error: ${err?.message || 'Invalid JSON format'}` };
  }
}

export async function resetToDefaults(): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDB();
  if (!db) return;

  await db.clear('prompts');
  await db.clear('custom_templates');
  await initStorage();
  broadcastStorageSync({ type: 'STORAGE_RESET' });
}
