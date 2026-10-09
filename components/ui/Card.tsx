import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  interactive = false,
  glow = false,
  style = {},
  className = '',
  ...props
}) => {
  return (
    <div
      style={{
        background: elevated ? 'var(--bg-elevated)' : 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '1.5rem',
        position: 'relative',
        transition: 'all var(--transition-normal)',
        boxShadow: glow ? 'var(--glow-cyan)' : 'var(--shadow-sm)',
        ...(interactive
          ? {
              cursor: 'pointer'
            }
          : {}),
        ...style
      }}
      className={`card-base ${interactive ? 'card-hoverable' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
