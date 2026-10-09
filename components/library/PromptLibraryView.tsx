'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StructuredPrompt } from '@/lib/types';
import {
  getAllPrompts,
  deletePrompt,
  duplicatePrompt,
  toggleFavoritePrompt,
  savePrompt,
  exportLibraryJson,
  subscribeToStorageSync
} from '@/lib/db/idb-storage';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import {
  Search,
  Star,
  Plus,
  Trash2,
  Copy,
  Edit,
  Download,
  Filter,
  ArrowUpDown,
  Terminal,
  Layers,
  FileCode,
  Calendar
} from 'lucide-react';
import { DEFAULT_PROMPT_CATEGORIES } from '@/lib/data/default-templates';

export const PromptLibraryView: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();

  const [prompts, setPrompts] = useState<StructuredPrompt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  useEffect(() => {
    loadPrompts();
    const unsubscribe = subscribeToStorageSync(() => {
      loadPrompts();
    });
    return () => unsubscribe();
  }, []);

  const loadPrompts = async () => {
    const list = await getAllPrompts();
    setPrompts(list);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await toggleFavoritePrompt(id);
    await loadPrompts();
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const copy = await duplicatePrompt(id);
    if (copy) {
      await loadPrompts();
      showToast(`Duplicated "${copy.title}"`, 'success');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      await deletePrompt(id);
      await loadPrompts();
      showToast('Prompt deleted from library', 'info');
    }
  };

  const handleExportSingle = (e: React.MouseEvent, p: StructuredPrompt) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(p, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported prompt JSON', 'info');
  };

  const handleExportFullLibrary = async () => {
    const jsonStr = await exportLibraryJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptforge-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Exported complete library backup!', 'success');
  };

  // Filter & Sort
  const filteredPrompts = useMemo(() => {
    return prompts
      .filter((p) => {
        const matchesSearch =
          searchQuery.trim() === '' ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory =
          selectedCategory === 'all' || p.category === selectedCategory;

        const matchesFav = !onlyFavorites || p.isFavorite;

        return matchesSearch && matchesCategory && matchesFav;
      })
      .sort((a, b) => {
        if (sortBy === 'created') return b.createdAt - a.createdAt;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return b.updatedAt - a.updatedAt;
      });
  }, [prompts, searchQuery, selectedCategory, onlyFavorites, sortBy]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Saved Prompt Library
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage, duplicate, search, and export your local collection of structured AI prompts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={handleExportFullLibrary} icon={<Download size={14} />}>
            Export Full Backup
          </Button>

          <Link href="/">
            <Button variant="emerald" size="sm" icon={<Plus size={14} />}>
              Create New Prompt
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.25rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search prompts by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 0.85rem 0.6rem 2.25rem',
                fontSize: '0.9rem',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 0.85rem',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <option value="updated">Recently Edited</option>
              <option value="created">Recently Created</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills & Favorites Toggle */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`selectable-chip ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            All Categories ({prompts.length})
          </button>

          {DEFAULT_PROMPT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const count = prompts.filter((p) => p.category === cat.slug).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`selectable-chip ${isSelected ? 'active' : ''}`}
              >
                {cat.name} ({count})
              </button>
            );
          })}

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`selectable-chip ${onlyFavorites ? 'active' : ''}`}
            style={{ marginLeft: 'auto' }}
          >
            <Star size={12} fill={onlyFavorites ? 'var(--accent-cyan)' : 'none'} />
            Favorites Only ({prompts.filter((p) => p.isFavorite).length})
          </button>
        </div>
      </div>

      {/* Prompts Cards Grid */}
      {filteredPrompts.length === 0 ? (
        <Card style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Layers size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            No saved prompts found
          </h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Try resetting your search query or create a new prompt from scratch.
          </p>
          <Link href="/">
            <Button variant="emerald" size="md" icon={<Plus size={14} />}>
              Create New Prompt
            </Button>
          </Link>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filteredPrompts.map((p) => (
            <Card
              key={p.id}
              elevated
              interactive
              onClick={() => router.push(`/?prompt=${p.id}`)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative'
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <Badge variant="cyan" size="sm">
                  {p.category.replace(/-/g, ' ').toUpperCase()}
                </Badge>

                <button
                  onClick={(e) => handleToggleFavorite(e, p.id)}
                  style={{
                    color: p.isFavorite ? 'var(--accent-amber)' : 'var(--text-muted)',
                    padding: '0.2rem',
                    cursor: 'pointer'
                  }}
                  aria-label="Toggle favorite"
                >
                  <Star size={16} fill={p.isFavorite ? 'var(--accent-amber)' : 'none'} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {p.title}
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flex: 1, lineHeight: 1.5 }}>
                {p.description}
              </p>

              {/* Sections & Date info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <span>{p.sections.filter((s) => s.enabled).length} active sections</span>
                <span>Edited {new Date(p.updatedAt).toLocaleDateString()}</span>
              </div>

              {/* Action buttons footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: 'auto'
                }}
              >
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={(e) => handleDuplicate(e, p.id)}
                    style={{
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      cursor: 'pointer'
                    }}
                    title="Duplicate prompt"
                  >
                    <Copy size={13} />
                  </button>

                  <button
                    onClick={(e) => handleExportSingle(e, p)}
                    style={{
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      cursor: 'pointer'
                    }}
                    title="Export JSON"
                  >
                    <Download size={13} />
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, p.id, p.title)}
                    style={{
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--accent-rose)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      cursor: 'pointer'
                    }}
                    title="Delete prompt"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <Link href={`/?prompt=${p.id}`} onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="emerald" icon={<Terminal size={13} />}>
                    Open in Builder
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
