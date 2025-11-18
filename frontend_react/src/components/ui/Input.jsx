import React, { useId } from 'react';

/**
 * PUBLIC_INTERFACE
 * Input: Text input with Ocean theme styling.
 * Props:
 * - label: string
 * - hint: string (supporting text)
 * - error: string (error text)
 * - icon: React node (leading)
 */
export default function Input({
  label,
  hint,
  error,
  icon,
  id,
  className = '',
  ...rest
}) {
  const reactId = useId();
  const inputId = id || `input-${reactId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  const baseStyle = {
    width: '100%',
    background: 'var(--surface)',
    border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
    borderRadius: 'var(--radius)',
    padding: '10px 12px',
    paddingLeft: icon ? 40 : 12,
    color: 'var(--text)',
    outline: 'none',
    boxShadow: 'var(--shadow-xs)',
    transition: 'box-shadow var(--transition), border-color var(--transition)',
  };

  const wrapperStyle = {
    position: 'relative',
    display: 'grid',
    gap: 6,
  };

  return (
    <label className={className} htmlFor={inputId} style={{ display: 'grid', gap: 6 }}>
      {label && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>}
      <div style={wrapperStyle}>
        {icon && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.6,
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          style={baseStyle}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          onFocus={(e) => (e.currentTarget.style.boxShadow = 'var(--focus-ring)')}
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-xs)')}
          {...rest}
        />
      </div>
      {error ? (
        <span id={errorId} role="alert" style={{ color: 'var(--error)', fontSize: 12 }}>
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}
