import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Button: Reusable button component with Ocean Professional theme.
 * Props:
 * - variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * - size: 'sm' | 'md' | 'lg'
 * - loading: boolean (disables and shows spinner)
 * - leftIcon, rightIcon: React nodes
 * - as: string or component to render as (defaults to 'button')
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  as: Comp = 'button',
  className = '',
  ...rest
}) {
  const base =
    'u-interactive inline-flex items-center justify-center gap-2 font-semibold';
  const sizes = {
    sm: { pad: '6px 10px', radius: 'var(--radius-sm)', fs: 13 },
    md: { pad: '8px 14px', radius: 'var(--radius)', fs: 14 },
    lg: { pad: '12px 18px', radius: 'var(--radius-lg)', fs: 16 },
  }[size];

  const stylesByVariant = {
    primary: {
      background: 'var(--primary)',
      color: '#fff',
      border: '1px solid rgba(37,99,235,0.6)',
      hoverBg: 'rgba(37,99,235,0.92)',
    },
    secondary: {
      background: 'var(--secondary)',
      color: '#111827',
      border: '1px solid rgba(245,158,11,0.5)',
      hoverBg: 'rgba(245,158,11,0.92)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text)',
      border: '1px solid var(--border-strong)',
      hoverBg: 'rgba(17,24,39,0.04)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text)',
      border: '1px solid transparent',
      hoverBg: 'rgba(17,24,39,0.04)',
    },
    danger: {
      background: 'var(--error)',
      color: '#fff',
      border: '1px solid rgba(239,68,68,0.6)',
      hoverBg: 'rgba(239,68,68,0.92)',
    },
  }[variant];

  const style = {
    background: stylesByVariant.background,
    color: stylesByVariant.color,
    border: stylesByVariant.border,
    padding: sizes.pad,
    borderRadius: sizes.radius,
    fontSize: sizes.fs,
    boxShadow: 'var(--shadow-sm)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'transform var(--transition), background-color var(--transition)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };

  const onMouseEnter = (e) => {
    if (disabled || loading) return;
    e.currentTarget.style.background = stylesByVariant.hoverBg || style.background;
    e.currentTarget.style.transform = 'translateY(-1px)';
  };
  const onMouseLeave = (e) => {
    e.currentTarget.style.background = stylesByVariant.background;
    e.currentTarget.style.transform = 'none';
  };

  return (
    <Comp
      className={`${base} ${className}`}
      style={style}
      aria-disabled={disabled || loading ? true : undefined}
      disabled={Comp === 'button' ? disabled || loading : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          style={{
            width: 16,
            height: 16,
            border: '2px solid rgba(255,255,255,0.5)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      )}
      {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .items-center { align-items: center; }
        .inline-flex { display: inline-flex; }
        .justify-center { justify-content: center; }
        .gap-2 { gap: 8px; }
        .font-semibold { font-weight: 600; }
      `}</style>
    </Comp>
  );
}
