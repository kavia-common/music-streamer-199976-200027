import React from 'react';

/**
 * PUBLIC_INTERFACE
 * TabBar: Simple segmented control for tabs.
 * Props:
 * - tabs: Array<{ key: string, label: string, count?: number }>
 * - active: string
 * - onChange: (key: string) => void
 */
export function TabBar({ tabs = [], active, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Search result categories"
      className="u-card"
      style={{
        display: 'flex',
        gap: 6,
        padding: 6,
        borderRadius: 'var(--radius-full)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        width: 'fit-content',
      }}
    >
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(t.key)}
            className="u-interactive"
            style={{
              border: '1px solid ' + (isActive ? 'rgba(37,99,235,0.35)' : 'transparent'),
              background: isActive ? 'rgba(37,99,235,0.10)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text)',
              padding: '8px 12px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {t.label}
            {typeof t.count === 'number' ? (
              <span
                aria-hidden="true"
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}
              >
                {t.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * ResultsTab: Container for tabbed content with Ocean Professional style.
 * Props:
 * - children: React nodes
 */
export function ResultsTab({ children }) {
  return <div style={{ marginTop: 12 }}>{children}</div>;
}
