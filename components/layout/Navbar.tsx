'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Terminal,
  FolderOpen,
  Layers,
  Wand2,
  BookOpen,
  Settings,
  Plus,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { subscribeToStorageSync, broadcastStorageSync } from '@/lib/db/idb-storage';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('promptforge_theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.documentElement.setAttribute('data-theme', 'light');
    }

    const unsubscribe = subscribeToStorageSync((msg) => {
      if (msg.type === 'SETTINGS_CHANGED' && msg.theme) {
        const isLight = msg.theme === 'light';
        setIsLightMode(isLight);
        if (isLight) {
          document.documentElement.setAttribute('data-theme', 'light');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isLightMode;
    setIsLightMode(nextTheme);
    const themeName = nextTheme ? 'light' : 'dark';
    if (nextTheme) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('promptforge_theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('promptforge_theme', 'dark');
    }
    broadcastStorageSync({ type: 'SETTINGS_CHANGED', theme: themeName });
  };

  const navItems = [
    { label: 'Studio', href: '/', icon: Terminal },
    { label: 'Library', href: '/library', icon: FolderOpen },
    { label: 'Blueprints', href: '/templates', icon: Layers },
    { label: 'Auditor', href: '/optimizer', icon: Wand2 },
    { label: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'all var(--transition-normal)'
      }}
    >
      <div
        style={{
          maxWidth: '1560px',
          margin: '0 auto',
          padding: '0.65rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)'
                }}
              >
                PROMPTFORGE
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            alignItems: 'center',
            gap: '0.35rem'
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={14} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label="Toggle theme"
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <Link href="/?action=new" className="desktop-cta">
            <Button variant="emerald" size="sm" icon={<Plus size={14} />}>
              New Prompt
            </Button>
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            className="mobile-nav-toggle"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--text-highlight)' : 'var(--text-primary)',
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  fontWeight: 500,
                  fontSize: '0.9rem'
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <div style={{ marginTop: '0.5rem' }}>
            <Link href="/?action=new" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="emerald" fullWidth size="sm" icon={<Plus size={14} />}>
                Create New Prompt
              </Button>
            </Link>
          </div>
        </div>
      )}


    </header>
  );
};
