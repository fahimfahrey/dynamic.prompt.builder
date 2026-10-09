'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceSettings, OutputFormat, TargetModel } from '@/lib/types';
import {
  getWorkspaceSettings,
  saveWorkspaceSettings,
  exportLibraryJson,
  importLibraryJson,
  resetToDefaults,
  getAllPrompts,
  subscribeToStorageSync
} from '@/lib/db/idb-storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import {
  Settings,
  Database,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  Shield,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { showToast } = useToast();

  const [settings, setSettings] = useState<WorkspaceSettings>({
    theme: 'dark',
    defaultOutputFormat: 'markdown',
    defaultTargetModel: 'claude-3-7-sonnet',
    autoSave: true,
    showQualityPanel: true
  });

  const [promptCount, setPromptCount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const refreshData = () => {
      getWorkspaceSettings().then(setSettings);
      getAllPrompts().then((p) => setPromptCount(p.length));
    };
    refreshData();
    const unsubscribe = subscribeToStorageSync(refreshData);
    return () => unsubscribe();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveWorkspaceSettings(settings);

      // Apply theme
      if (settings.theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('promptforge_theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('promptforge_theme', 'dark');
      }

      showToast('Settings saved successfully!', 'success');
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = async () => {
    const jsonStr = await exportLibraryJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Library exported successfully as JSON!', 'success');
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Backup file exceeds 5MB limit', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const res = await importLibraryJson(content);
      if (res.success) {
        showToast(res.message, 'success');
        getAllPrompts().then((p) => setPromptCount(p.length));
      } else {
        showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefaults = async () => {
    if (confirm('Are you sure you want to reset your local library to factory defaults? All custom prompts will be replaced.')) {
      await resetToDefaults();
      const updated = await getAllPrompts();
      setPromptCount(updated.length);
      showToast('Reset local database to factory seed prompts', 'info');
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Workspace & Data Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Configure prompt formatting preferences, appearance, and local IndexedDB backups.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Workspace Preferences Form */}
        <form onSubmit={handleSaveSettings}>
          <Card elevated style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              Prompt Formatting Defaults
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Default Structuring Format
                </label>
                <select
                  value={settings.defaultOutputFormat}
                  onChange={(e) => setSettings({ ...settings, defaultOutputFormat: e.target.value as OutputFormat })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.75rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="markdown">Markdown Headings (## SECTION)</option>
                  <option value="xml">XML Tags (&lt;section&gt;...&lt;/section&gt;)</option>
                  <option value="plain">Plain Text (--- SECTION ---)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Default Target AI Model
                </label>
                <select
                  value={settings.defaultTargetModel}
                  onChange={(e) => setSettings({ ...settings, defaultTargetModel: e.target.value as TargetModel })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.75rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="claude-3-7-sonnet">Claude 3.7 Sonnet</option>
                  <option value="gpt-4-5">GPT-4.5 Preview</option>
                  <option value="gemini-2-pro">Gemini 2.0 Pro</option>
                  <option value="deepseek-r1">DeepSeek R1</option>
                  <option value="universal">Universal / Coding Agents</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Theme Appearance
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'dark' | 'light' })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.75rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="dark">Dark OLED (Default)</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <Button type="submit" variant="emerald" isLoading={isSaving}>
                Save Preferences
              </Button>
            </div>
          </Card>
        </form>

        {/* Local Storage & Backup Management */}
        <Card elevated style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Local IndexedDB Data & Backups
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Your prompts are stored 100% locally in your web browser. You can export a JSON backup to transfer your library across machines or browsers.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Storage Engine</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Browser IndexedDB
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saved Prompts</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {promptCount}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                Online & Synced
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="emerald" onClick={handleExportBackup} icon={<Download size={14} />}>
              Download Full Library Backup (JSON)
            </Button>

            <label>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <Upload size={14} />
                Restore from Backup File
              </span>
              <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Reset / Danger Zone */}
          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '0.35rem' }}>
              Factory Seed Reset
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Resets your local IndexedDB prompts to the factory default blueprints.
            </p>
            <Button variant="danger" size="sm" onClick={handleResetToDefaults} icon={<RotateCcw size={14} />}>
              Reset Library to Factory Defaults
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
