'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  StructuredPrompt,
  PromptSection,
  OutputFormat,
  TargetModel
} from '@/lib/types';
import {
  getAllPrompts,
  getPromptById,
  savePrompt,
  deletePrompt,
  duplicatePrompt,
  toggleFavoritePrompt,
  createDefaultPrompt,
  getAllTemplates,
  getActivePromptId,
  setActivePromptId,
  subscribeToStorageSync
} from '@/lib/db/idb-storage';
import {
  composePrompt,
  calculatePromptStats,
  auditPromptQuality
} from '@/lib/prompt-engine/composer';
import { SectionCard } from './SectionCard';
import { GuidedWizard } from './GuidedWizard';
import { QualityChecklist } from './QualityChecklist';
import { DynamicSelectableBuilder } from './DynamicSelectableBuilder';
import { FirstSessionStepperModal } from './FirstSessionStepperModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';
import {
  Plus,
  Save,
  Copy,
  Check,
  RotateCcw,
  Download,
  Trash2,
  Star,
  Layers,
  Terminal,
  Wand2,
  Search,
  FileCode,
  FileText,
  RefreshCw,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  Sliders,
  CheckCircle2,
  ExternalLink,
  FolderOpen,
  X
} from 'lucide-react';
import { BUILT_IN_TEMPLATES, DEFAULT_PROMPT_CATEGORIES } from '@/lib/data/default-templates';

interface PromptBuilderWorkspaceProps {
  initialPromptId?: string;
  initialTemplateId?: string;
}

export const PromptBuilderWorkspace: React.FC<PromptBuilderWorkspaceProps> = ({
  initialPromptId,
  initialTemplateId
}) => {
  const { showToast } = useToast();

  // Library & Prompt State
  const [prompts, setPrompts] = useState<StructuredPrompt[]>([]);
  const [activePrompt, setActivePrompt] = useState<StructuredPrompt>(() =>
    createDefaultPrompt('New Developer Prompt', initialTemplateId || 'tmpl-refurbish-existing-app')
  );

  // View & UI State
  const [editorMode, setEditorMode] = useState<'dynamic' | 'sections' | 'wizard' | 'raw'>('dynamic');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [searchLibraryQuery, setSearchLibraryQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLibraryDrawerOpen, setIsLibraryDrawerOpen] = useState(false);
  const [showQualityDetails, setShowQualityDetails] = useState(false);
  const [isQuickStepperOpen, setIsQuickStepperOpen] = useState(false);

  // Auto-open Quick Stepper on first session
  useEffect(() => {
    try {
      const isDone = localStorage.getItem('promptforge_first_session_done');
      if (!isDone) {
        setIsQuickStepperOpen(true);
      }
    } catch (_) {}
  }, []);

  // Track initial mount to prevent immediate auto-save flash
  const isInitialMount = useRef(true);
  const activePromptRef = useRef<StructuredPrompt>(activePrompt);
  activePromptRef.current = activePrompt;

  // Load prompts and active prompt from IndexedDB
  useEffect(() => {
    getAllPrompts().then((loaded) => {
      if (loaded.length > 0) {
        setPrompts(loaded);
        const lastActiveId = getActivePromptId();
        const match = initialPromptId
          ? loaded.find((p) => p.id === initialPromptId)
          : initialTemplateId
          ? createDefaultPrompt('New Prompt', initialTemplateId)
          : (lastActiveId ? loaded.find((p) => p.id === lastActiveId) : null) || loaded[0];

        if (match) {
          setActivePrompt(match);
          setActivePromptId(match.id);
        }
      } else {
        const fresh = createDefaultPrompt('New Developer Prompt', initialTemplateId || 'tmpl-refurbish-existing-app');
        setActivePrompt(fresh);
        setActivePromptId(fresh.id);
        savePrompt(fresh).then((saved) => setPrompts([saved]));
      }
    });
  }, [initialPromptId, initialTemplateId]);

  // Real-Time Cross-Tab Synchronization
  useEffect(() => {
    const unsubscribe = subscribeToStorageSync(async (msg) => {
      if (msg.type === 'PROMPT_SAVED') {
        const refreshedList = await getAllPrompts();
        setPrompts(refreshedList);
        // If another tab modified the currently active prompt, sync smoothly
        if (msg.promptId === activePromptRef.current.id && msg.updatedAt > activePromptRef.current.updatedAt) {
          const remotePrompt = await getPromptById(msg.promptId);
          if (remotePrompt) {
            setActivePrompt(remotePrompt);
          }
        }
      } else if (msg.type === 'PROMPT_DELETED') {
        const refreshedList = await getAllPrompts();
        setPrompts(refreshedList);
        if (msg.promptId === activePromptRef.current.id) {
          if (refreshedList.length > 0) {
            setActivePrompt(refreshedList[0]);
            setActivePromptId(refreshedList[0].id);
          }
        }
      } else if (msg.type === 'PROMPTS_CHANGED' || msg.type === 'STORAGE_RESET') {
        const refreshedList = await getAllPrompts();
        setPrompts(refreshedList);
        if (refreshedList.length > 0) {
          const match = refreshedList.find((p) => p.id === activePromptRef.current.id) || refreshedList[0];
          setActivePrompt(match);
          setActivePromptId(match.id);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Debounced Auto-Save to IndexedDB (Ensures 100% Data Persistence on typing/clicking)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const saved = await savePrompt(activePrompt);
        setPrompts((prev) => {
          const idx = prev.findIndex((p) => p.id === saved.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = saved;
            return updated;
          }
          return [saved, ...prev];
        });
      } catch (err) {
        console.warn('Auto-save error:', err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [activePrompt]);

  // Deterministically composed prompt text
  const composedText = useMemo(() => {
    if (activePrompt.isManuallyEdited && activePrompt.rawPromptOverride) {
      return activePrompt.rawPromptOverride;
    }
    return composePrompt(activePrompt.sections, activePrompt.outputFormat);
  }, [activePrompt.sections, activePrompt.outputFormat, activePrompt.isManuallyEdited, activePrompt.rawPromptOverride]);

  // Statistics calculation
  const stats = useMemo(() => {
    return calculatePromptStats(composedText, activePrompt.sections);
  }, [composedText, activePrompt.sections]);

  // Quality check report
  const qualityReport = useMemo(() => {
    return auditPromptQuality(activePrompt.sections, composedText);
  }, [activePrompt.sections, composedText]);

  // Handle saving the current prompt
  const handleSavePrompt = useCallback(async () => {
    setIsSaving(true);
    try {
      const saved = await savePrompt(activePrompt);
      setPrompts((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
      showToast(`Prompt "${saved.title}" saved locally to IndexedDB!`, 'success');
    } catch {
      showToast('Error saving prompt', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [activePrompt, showToast]);

  // Handle copying prompt text
  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(composedText);
      setCopied(true);
      showToast('Structured prompt copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy. Please manually copy from raw output.', 'error');
    }
  }, [composedText, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S: Save
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSavePrompt();
      }
      // Cmd/Ctrl + Shift + C: Copy
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyPrompt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSavePrompt, handleCopyPrompt]);

  // Filtered prompts for sidebar
  const filteredSidebarPrompts = useMemo(() => {
    return prompts.filter((p) => {
      const matchesSearch =
        searchLibraryQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchLibraryQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchLibraryQuery.toLowerCase());
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [prompts, searchLibraryQuery, categoryFilter]);

  // Handle section updates
  const handleUpdateSection = (updated: PromptSection) => {
    const updatedSections = activePrompt.sections.map((s) => (s.id === updated.id ? updated : s));
    setActivePrompt({
      ...activePrompt,
      sections: updatedSections,
      isManuallyEdited: false,
      rawPromptOverride: undefined
    });
  };

  // Reorder sections
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activePrompt.sections.length) return;

    const sections = [...activePrompt.sections];
    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    const reordered = sections.map((s, idx) => ({ ...s, order: idx }));
    setActivePrompt({
      ...activePrompt,
      sections: reordered,
      isManuallyEdited: false
    });
  };

  // Duplicate a section
  const handleDuplicateSection = (section: PromptSection) => {
    const newSection: PromptSection = {
      ...section,
      id: `sec-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${section.title} (Copy)`,
      isCustom: true,
      order: activePrompt.sections.length
    };
    setActivePrompt({
      ...activePrompt,
      sections: [...activePrompt.sections, newSection],
      isManuallyEdited: false
    });
    showToast(`Duplicated section "${section.title}"`, 'info');
  };

  // Delete custom section
  const handleDeleteSection = (sectionId: string) => {
    const remaining = activePrompt.sections.filter((s) => s.id !== sectionId);
    setActivePrompt({
      ...activePrompt,
      sections: remaining.map((s, idx) => ({ ...s, order: idx })),
      isManuallyEdited: false
    });
    showToast('Section removed', 'info');
  };

  // Add custom section
  const handleAddCustomSection = () => {
    const newSection: PromptSection = {
      id: `sec-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      key: `custom_${Date.now()}`,
      title: 'CUSTOM SECTION',
      content: 'Specify your custom requirements, domain constraints, or specialized context here.',
      enabled: true,
      isCustom: true,
      order: activePrompt.sections.length
    };
    setActivePrompt({
      ...activePrompt,
      sections: [...activePrompt.sections, newSection],
      isManuallyEdited: false
    });
    showToast('Added new custom section', 'success');
  };

  // Create new prompt
  const handleNewPrompt = () => {
    const newPrompt = createDefaultPrompt('Untitled Developer Prompt', 'tmpl-refurbish-existing-app');
    setActivePrompt(newPrompt);
    setActivePromptId(newPrompt.id);
    savePrompt(newPrompt).then((saved) => {
      setPrompts((prev) => [saved, ...prev]);
      showToast('Created new draft prompt!', 'success');
    });
  };

  // Load a prompt from sidebar
  const handleSelectPrompt = (id: string) => {
    const found = prompts.find((p) => p.id === id);
    if (found) {
      setActivePrompt(found);
      setActivePromptId(found.id);
      setMobileTab('editor');
    }
  };

  // Apply template blueprint
  const handleApplyTemplate = (templateId: string) => {
    const tmpl = BUILT_IN_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    const promptFromTmpl = createDefaultPrompt(tmpl.title, templateId);
    setActivePrompt(promptFromTmpl);
    setActivePromptId(promptFromTmpl.id);
    savePrompt(promptFromTmpl).then((saved) => {
      setPrompts((prev) => [saved, ...prev]);
      showToast(`Loaded blueprint "${tmpl.title}"`, 'info');
    });
  };

  // Delete prompt
  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt? This cannot be undone.')) return;
    await deletePrompt(id);
    const updated = prompts.filter((p) => p.id !== id);
    setPrompts(updated);
    if (activePrompt.id === id) {
      if (updated.length > 0) {
        setActivePrompt(updated[0]);
        setActivePromptId(updated[0].id);
      } else {
        handleNewPrompt();
      }
    }
    showToast('Prompt deleted', 'info');
  };

  // Apply prompt generated from quick stepper
  const handleApplyQuickPrompt = useCallback(async (newPrompt: StructuredPrompt) => {
    setActivePrompt(newPrompt);
    setActivePromptId(newPrompt.id);
    const saved = await savePrompt(newPrompt);
    setPrompts((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
  }, []);

  return (
    <div className="workspace-container">
      {/* MINIMAL TOP BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.65rem 1rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1rem'
        }}
      >
        {/* Left: Prompts button + Editable Title + Auto-saved status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '260px' }}>
          <button
            onClick={() => setIsLibraryDrawerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Open saved prompts library"
          >
            <FolderOpen size={13} color="var(--accent-cyan)" />
            <span>Prompts ({prompts.length})</span>
          </button>

          <button
            onClick={() => setIsQuickStepperOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: 'var(--accent-cyan)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Launch Instant Prompt Stepper"
          >
            <Sparkles size={13} />
            <span>⚡ Quick Stepper</span>
          </button>

          <input
            type="text"
            value={activePrompt.title}
            onChange={(e) => setActivePrompt({ ...activePrompt, title: e.target.value })}
            placeholder="Untitled Prompt..."
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid transparent',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              padding: '0.2rem 0.4rem',
              width: '100%',
              maxWidth: '380px',
              outline: 'none',
              transition: 'border-color var(--transition-fast)'
            }}
            onFocus={(e) => (e.target.style.borderBottomColor = 'var(--accent-cyan)')}
            onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
          />

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.72rem',
              color: 'var(--accent-emerald)',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></span>
            Saved
          </span>
        </div>

        {/* Right: Format select, Model select, Copy, New prompt */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={activePrompt.outputFormat}
            onChange={(e) =>
              setActivePrompt({
                ...activePrompt,
                outputFormat: e.target.value as OutputFormat,
                isManuallyEdited: false
              })
            }
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.55rem',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <option value="markdown">Markdown</option>
            <option value="xml">XML Tags</option>
            <option value="plain">Plain Text</option>
          </select>

          <select
            value={activePrompt.targetModel}
            onChange={(e) =>
              setActivePrompt({
                ...activePrompt,
                targetModel: e.target.value as TargetModel
              })
            }
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.55rem',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <option value="antigravity">⭐ Google Antigravity (AGY)</option>
            <option value="claude-3-7-sonnet">Claude 3.7 Sonnet</option>
            <option value="gpt-4-5">GPT-4.5 Preview</option>
            <option value="gemini-2-pro">Gemini 2.0 Pro</option>
            <option value="deepseek-r1">DeepSeek R1</option>
            <option value="universal">Universal / Other</option>
          </select>

          <Button
            variant={copied ? 'emerald' : 'primary'}
            size="sm"
            onClick={handleCopyPrompt}
            icon={copied ? <Check size={13} /> : <Copy size={13} />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <button
            onClick={handleNewPrompt}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={13} /> New
          </button>
        </div>
      </div>

      {/* MOBILE SEGMENTED VIEW SWITCHER (< 1024px) */}
      <div
        style={{
          display: 'none',
          background: 'var(--bg-elevated)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-medium)',
          marginBottom: '1rem'
        }}
        className="mobile-view-tabs"
      >
        <button
          onClick={() => setMobileTab('editor')}
          style={{
            flex: 1,
            padding: '0.45rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            fontWeight: 700,
            background: mobileTab === 'editor' ? 'var(--bg-card)' : 'transparent',
            color: mobileTab === 'editor' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            border: mobileTab === 'editor' ? '1px solid var(--border-subtle)' : 'none',
            cursor: 'pointer'
          }}
        >
          ⚡ Builder
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          style={{
            flex: 1,
            padding: '0.45rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            fontWeight: 700,
            background: mobileTab === 'preview' ? 'var(--bg-card)' : 'transparent',
            color: mobileTab === 'preview' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            border: mobileTab === 'preview' ? '1px solid var(--border-subtle)' : 'none',
            cursor: 'pointer'
          }}
        >
          📄 Output ({qualityReport.score}/100)
        </button>
      </div>

      {/* CLEAN 2-PANE WORKSPACE GRID */}
      <div className="workspace-layout-grid">
        {/* LEFT PANE: Builder Canvas */}
        <div
          style={{
            display: mobileTab === 'preview' ? 'none' : 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            minWidth: 0
          }}
        >
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '0.25rem',
                background: 'var(--bg-elevated)',
                padding: '0.2rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <button
                onClick={() => setEditorMode('dynamic')}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: editorMode === 'dynamic' ? 700 : 500,
                  background: editorMode === 'dynamic' ? 'var(--bg-card)' : 'transparent',
                  color: editorMode === 'dynamic' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ⚡ Dynamic Builder
              </button>

              <button
                onClick={() => setEditorMode('sections')}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: editorMode === 'sections' ? 700 : 500,
                  background: editorMode === 'sections' ? 'var(--bg-card)' : 'transparent',
                  color: editorMode === 'sections' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📑 Sections ({activePrompt.sections.length})
              </button>

              <button
                onClick={() => setEditorMode('wizard')}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: editorMode === 'wizard' ? 700 : 500,
                  background: editorMode === 'wizard' ? 'var(--bg-card)' : 'transparent',
                  color: editorMode === 'wizard' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🧙 Wizard
              </button>

              <button
                onClick={() => setEditorMode('raw')}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: editorMode === 'raw' ? 700 : 500,
                  background: editorMode === 'raw' ? 'var(--bg-card)' : 'transparent',
                  color: editorMode === 'raw' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📝 Raw
              </button>
            </div>

            {editorMode === 'sections' && (
              <Button size="sm" variant="outline" onClick={handleAddCustomSection} icon={<Plus size={12} />}>
                Add Section
              </Button>
            )}
          </div>

          {/* MODE 1: DYNAMIC BUILDER */}
          {editorMode === 'dynamic' && (
            <DynamicSelectableBuilder
              prompt={activePrompt}
              onChange={setActivePrompt}
              onSave={handleSavePrompt}
              onCopy={handleCopyPrompt}
              copied={copied}
              isSaving={isSaving}
              stats={stats}
              qualityReport={qualityReport}
              composedText={composedText}
            />
          )}

          {/* MODE 2: DIRECT SECTIONS */}
          {editorMode === 'sections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activePrompt.sections.map((section, idx) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  isFirst={idx === 0}
                  isLast={idx === activePrompt.sections.length - 1}
                  onUpdate={handleUpdateSection}
                  onMoveUp={() => handleMoveSection(idx, 'up')}
                  onMoveDown={() => handleMoveSection(idx, 'down')}
                  onDuplicate={() => handleDuplicateSection(section)}
                  onDelete={() => handleDeleteSection(section.id)}
                />
              ))}
            </div>
          )}

          {/* MODE 3: GUIDED WIZARD */}
          {editorMode === 'wizard' && (
            <GuidedWizard
              prompt={activePrompt}
              onChange={setActivePrompt}
              onFinish={() => {
                setEditorMode('dynamic');
                showToast('Prompt built successfully!', 'success');
              }}
            />
          )}

          {/* MODE 4: RAW OVERRIDE */}
          {editorMode === 'raw' && (
            <Card elevated style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                value={composedText}
                onChange={(e) => {
                  setActivePrompt({
                    ...activePrompt,
                    isManuallyEdited: true,
                    rawPromptOverride: e.target.value
                  });
                }}
                rows={22}
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  resize: 'vertical'
                }}
              />
            </Card>
          )}
        </div>

        {/* RIGHT PANE: Live Output & Minimal Metrics */}
        <div
          style={{
            display: mobileTab === 'editor' ? undefined : 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            minWidth: 0
          }}
        >
          <Card
            style={{
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              minHeight: '620px'
            }}
          >
            {/* Header bar of prompt output */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                paddingBottom: '0.65rem',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--accent-emerald)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {qualityReport.score}/100 Grade {qualityReport.grade}
                </span>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ~{stats.estimatedTokens.toLocaleString()} tokens
                </span>

                <button
                  onClick={() => setShowQualityDetails(!showQualityDetails)}
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {showQualityDetails ? 'Hide audit' : 'Audit details (7/7)'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Button variant="emerald" size="sm" onClick={handleCopyPrompt} icon={copied ? <Check size={13} /> : <Copy size={13} />}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([composedText], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${activePrompt.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
                    a.click();
                    showToast('Downloaded .md file', 'info');
                  }}
                  icon={<Download size={13} />}
                >
                  .md
                </Button>
              </div>
            </div>

            {/* Expandable Quality Audit Details */}
            {showQualityDetails && (
              <div style={{ padding: '0.85rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <QualityChecklist report={qualityReport} />
              </div>
            )}

            {/* Monospace Prompt Preview Container */}
            <div
              style={{
                flex: 1,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                maxHeight: 'calc(100vh - 240px)',
                overflowY: 'auto'
              }}
            >
              <pre
                style={{
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6
                }}
              >
                {composedText || '(Composing prompt...)'}
              </pre>
            </div>
          </Card>
        </div>
      </div>

      {/* SLIDE-OVER PROMPTS DRAWER */}
      {isLibraryDrawerOpen && (
        <div className="prompts-drawer-overlay" onClick={() => setIsLibraryDrawerOpen(false)}>
          <div className="prompts-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                My Prompts ({prompts.length})
              </h3>
              <button
                onClick={() => setIsLibraryDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchLibraryQuery}
                onChange={(e) => setSearchLibraryQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.45rem 0.65rem 0.45rem 2rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}
            >
              <option value="all">All Categories</option>
              {DEFAULT_PROMPT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto', flex: 1 }}>
              {filteredSidebarPrompts.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                  No prompts found
                </p>
              ) : (
                filteredSidebarPrompts.map((p) => {
                  const isSelected = p.id === activePrompt.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        handleSelectPrompt(p.id);
                        setIsLibraryDrawerOpen(false);
                      }}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--bg-elevated)' : 'transparent',
                        border: isSelected ? '1px solid var(--border-medium)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? 'var(--text-highlight)' : 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '220px'
                          }}
                        >
                          {p.title}
                        </span>
                        {p.isFavorite && <Star size={11} fill="var(--accent-amber)" color="var(--accent-amber)" />}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>{p.sections.filter((s) => s.enabled).length} sections</span>
                        <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Button
                variant="emerald"
                fullWidth
                size="sm"
                onClick={() => {
                  handleNewPrompt();
                  setIsLibraryDrawerOpen(false);
                }}
                icon={<Plus size={13} />}
              >
                Create New Prompt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE STICKY ACTION BAR (< 1024px) */}
      <div className="mobile-sticky-action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
            {qualityReport.score}/100
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            ~{stats.estimatedTokens} tok
          </span>
        </div>

        <Button
          variant={copied ? 'emerald' : 'primary'}
          size="sm"
          onClick={handleCopyPrompt}
          icon={copied ? <Check size={13} /> : <Copy size={13} />}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      {/* FIRST SESSION STEPPER MODAL */}
      <FirstSessionStepperModal
        isOpen={isQuickStepperOpen}
        onClose={() => setIsQuickStepperOpen(false)}
        onApplyPrompt={handleApplyQuickPrompt}
      />
    </div>
  );
};
