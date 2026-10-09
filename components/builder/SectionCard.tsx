'use client';

import React, { useState } from 'react';
import { PromptSection } from '@/lib/types';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  RotateCcw,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';

interface SectionCardProps {
  section: PromptSection;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (updated: PromptSection) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  isFirst,
  isLast,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const wordCount = section.content.trim() ? section.content.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        background: section.enabled ? 'var(--bg-card)' : 'rgba(21, 30, 51, 0.4)',
        border: section.enabled ? '1px solid var(--border-medium)' : '1px dashed var(--border-subtle)',
        opacity: section.enabled ? 1 : 0.65,
        transition: 'all var(--transition-fast)',
        overflow: 'hidden'
      }}
      className="section-card-item"
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: '0.45rem',
          padding: '0.65rem 0.85rem',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
          <div
            style={{
              cursor: 'grab',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Section handle"
          >
            <GripVertical size={14} />
          </div>

          {/* Title or Title Input */}
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={section.title}
              onBlur={() => setIsEditingTitle(false)}
              onChange={(e) => onUpdate({ ...section, title: e.target.value })}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.15rem 0.4rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                width: '100%',
                maxWidth: '260px'
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename title"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: section.enabled ? 'var(--text-primary)' : 'var(--text-muted)',
                letterSpacing: '0.02em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {section.title}
            </span>
          )}

          {section.isCustom && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.35rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(139, 92, 246, 0.15)',
                color: 'var(--accent-violet)',
                fontWeight: 600
              }}
            >
              Custom
            </span>
          )}
        </div>

        {/* Section Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {/* Enable / Disable toggle */}
          <button
            onClick={() => onUpdate({ ...section, enabled: !section.enabled })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              background: section.enabled ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
              border: section.enabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
              color: section.enabled ? 'var(--accent-emerald)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title={section.enabled ? 'Disable section' : 'Enable section'}
          >
            {section.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>{section.enabled ? 'Active' : 'Muted'}</span>
          </button>

          {/* Move Up */}
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            style={{
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)',
              color: isFirst ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: isFirst ? 'not-allowed' : 'pointer',
              opacity: isFirst ? 0.4 : 1
            }}
            title="Move section up"
          >
            <ChevronUp size={14} />
          </button>

          {/* Move Down */}
          <button
            onClick={onMoveDown}
            disabled={isLast}
            style={{
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)',
              color: isLast ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: isLast ? 'not-allowed' : 'pointer',
              opacity: isLast ? 0.4 : 1
            }}
            title="Move section down"
          >
            <ChevronDown size={14} />
          </button>

          {/* Duplicate */}
          <button
            onClick={onDuplicate}
            style={{
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            title="Duplicate section"
          >
            <Copy size={13} />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            style={{
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-rose)',
              cursor: 'pointer'
            }}
            title="Delete section"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Section Content Textarea */}
      <div style={{ padding: '0.75rem' }}>
        <textarea
          rows={Math.max(2, Math.min(8, section.content.split('\n').length + 1))}
          value={section.content}
          onChange={(e) => onUpdate({ ...section, content: e.target.value })}
          placeholder={`Enter content for ${section.title.toLowerCase()}...`}
          disabled={!section.enabled}
          style={{
            width: '100%',
            background: section.enabled ? 'var(--bg-elevated)' : 'transparent',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.75rem',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.5,
            resize: 'vertical'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>{wordCount} words</span>
          <span>{section.content.length} chars</span>
        </div>
      </div>
    </div>
  );
};
