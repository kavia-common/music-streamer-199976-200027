import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Card: Surface container with optional header/footer slots and hoverable styling.
 * Props:
 * - hover: boolean (elevate on hover)
 * - header: React node
 * - footer: React node
 */
export default function Card({ children, header, footer, hover = false, className = '', ...rest }) {
  const style = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-md)',
    transition: 'transform var(--transition), box-shadow var(--transition)',
  };

  const onEnter = (e) => {
    if (!hover) return;
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
  };
  const onLeave = (e) => {
    if (!hover) return;
    e.currentTarget.style.transform = 'none';
    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
  };

  return (
    <section
      className={`u-card ${className}`}
      style={style}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      {...rest}
    >
      {header && (
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>{header}</div>
      )}
      <div style={{ padding: 16 }}>{children}</div>
      {footer && (
        <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>{footer}</div>
      )}
    </section>
  );
}
