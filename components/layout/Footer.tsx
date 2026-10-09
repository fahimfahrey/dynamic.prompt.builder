'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Command } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        padding: '0.85rem 1.5rem',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}
    >
      <div
        style={{
          maxWidth: '1520px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.85rem'
        }}
      >
        {/* Left: Brand & Local-First indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            <Sparkles size={13} color="var(--accent-cyan)" />
            <span>PROMPTFORGE</span>
          </div>
          <span style={{ color: 'var(--border-medium)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald)' }}>
            <Shield size={12} />
            <span>100% Client-Side · IndexedDB</span>
          </span>
        </div>

        {/* Center: Keyboard shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="footer-shortcuts">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '3px', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>⌘S</kbd>
            Save
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '3px', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>⇧⌘C</kbd>
            Copy
          </span>
        </div>

        {/* Right: Quick Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)' }}>Studio</Link>
          <Link href="/library" style={{ color: 'var(--text-secondary)' }}>Library</Link>
          <Link href="/templates" style={{ color: 'var(--text-secondary)' }}>Blueprints</Link>
          <Link href="/optimizer" style={{ color: 'var(--text-secondary)' }}>Auditor</Link>
          <Link href="/settings" style={{ color: 'var(--text-secondary)' }}>Settings</Link>
        </div>
      </div>
    </footer>
  );
};
