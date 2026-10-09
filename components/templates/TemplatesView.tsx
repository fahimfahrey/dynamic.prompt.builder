'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PromptTemplate } from '@/lib/types';
import { BUILT_IN_TEMPLATES, DEFAULT_PROMPT_CATEGORIES } from '@/lib/data/default-templates';
import { getAllTemplates, subscribeToStorageSync } from '@/lib/db/idb-storage';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import {
  Search,
  Terminal,
  Layers,
  Sparkles,
  ArrowRight,
  Code2,
  FileText,
  Layout,
  Check
} from 'lucide-react';

export const TemplatesView: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();

  const [templates, setTemplates] = useState<PromptTemplate[]>(BUILT_IN_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  React.useEffect(() => {
    const load = () => {
      getAllTemplates().then((all) => {
        if (all && all.length > 0) setTemplates(all);
      });
    };
    load();
    const unsubscribe = subscribeToStorageSync(load);
    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || t.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [templates, searchQuery, selectedCategory]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <Badge variant="cyan" size="md" icon={<Layers size={13} />}>
          Production Blueprints
        </Badge>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          AI Engineering Prompt Blueprints
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', fontSize: '1rem' }}>
          Explore battle-tested prompt templates across software development, design systems, system architecture, and technical planning.
        </p>
      </div>

      {/* Filter and Search */}
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
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search templates by goal, framework, or tag (e.g. Next.js, Refactoring, Debug, Architecture)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1rem 0.65rem 2.5rem',
              fontSize: '0.9rem',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`selectable-chip ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            All Blueprints ({templates.length})
          </button>

          {DEFAULT_PROMPT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const count = templates.filter((t) => t.category === cat.slug).length;
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
        </div>
      </div>

      {/* Templates Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {filtered.map((t) => (
          <Card
            key={t.id}
            elevated
            interactive
            onClick={() => router.push(`/?template=${t.id}`)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <Badge variant="cyan" size="sm">
                {t.category.replace(/-/g, ' ').toUpperCase()}
              </Badge>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t.sections.length} structured sections
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {t.title}
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flex: 1, lineHeight: 1.5 }}>
              {t.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(56, 189, 248, 0.08)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(56, 189, 248, 0.2)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div
              style={{
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <Link href={`/?template=${t.id}`} onClick={(e) => e.stopPropagation()}>
                <Button variant="emerald" size="sm" icon={<Terminal size={14} />}>
                  Use Blueprint in Studio
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
