import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'sm',
  className = '',
  icon
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    cyan: {
      background: 'rgba(6, 182, 212, 0.12)',
      color: 'var(--accent-cyan)',
      border: '1px solid rgba(6, 182, 212, 0.25)'
    },
    emerald: {
      background: 'rgba(16, 185, 129, 0.12)',
      color: 'var(--accent-emerald)',
      border: '1px solid rgba(16, 185, 129, 0.25)'
    },
    violet: {
      background: 'rgba(139, 92, 246, 0.12)',
      color: 'var(--accent-violet)',
      border: '1px solid rgba(139, 92, 246, 0.25)'
    },
    amber: {
      background: 'rgba(245, 158, 11, 0.12)',
      color: 'var(--accent-amber)',
      border: '1px solid rgba(245, 158, 11, 0.25)'
    },
    rose: {
      background: 'rgba(244, 63, 94, 0.12)',
      color: 'var(--accent-rose)',
      border: '1px solid rgba(244, 63, 94, 0.25)'
    },
    slate: {
      background: 'rgba(148, 163, 184, 0.1)',
      color: 'var(--text-secondary)',
      border: '1px solid rgba(148, 163, 184, 0.2)'
    }
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '0.15rem 0.55rem', fontSize: '0.75rem' },
    md: { padding: '0.25rem 0.75rem', fontSize: '0.85rem' }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontWeight: 500,
        borderRadius: 'var(--radius-full)',
        lineHeight: 1.2,
        ...variantStyles[variant],
        ...sizeStyles[size]
      }}
      className={className}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
