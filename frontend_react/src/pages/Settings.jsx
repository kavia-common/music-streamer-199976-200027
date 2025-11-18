import React, { useEffect, useId, useMemo, useState } from 'react';
import { storage } from '../utils/storage';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';

/**
 * PUBLIC_INTERFACE
 * Settings: Manages user preferences for theme and playback.
 * - Theme: system | light | dark (applies data-theme on <html>)
 * - Playback: autoplay (on queue start), explicit content filter, default volume
 * - Persists to localStorage and initializes on mount
 * - Honors REACT_APP_FEATURE_FLAGS and REACT_APP_EXPERIMENTS_ENABLED:
 *    - if experiments disabled, hides experimental sections
 *    - feature flags can hide/disable certain toggles (e.g., 'settings.explicit' or 'settings.autoplay')
 */

const SETTINGS_KEY = 'app.settings.v1';

export default function Settings() {
  const { featureFlags, experimentsEnabled } = useAuth();
  const [state, setState] = useState(() => loadSettings());

  // Derived visibility based on flags
  const showAutoplay = featureFlags['settings.autoplay'] !== false;
  const showExplicit = featureFlags['settings.explicit'] !== false;
  const showVolume = featureFlags['settings.volume'] !== false;
  const showTheme = featureFlags['settings.theme'] !== false;

  // Apply theme on mount and whenever state.themeMode changes
  useEffect(() => {
    applyTheme(state.themeMode);
  }, [state.themeMode]);

  // Persist settings when changed
  useEffect(() => {
    storage.setJson(SETTINGS_KEY, state);
  }, [state]);

  const onChange = (patch) => setState((s) => ({ ...s, ...patch }));

  return (
    <div className="page">
      <h1 className="page-title">Settings</h1>
      <p className="page-desc">Customize your appearance and playback preferences.</p>

      {showTheme && (
        <section className="u-card" style={{ marginTop: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>Appearance</h2>
          <ThemeSelector value={state.themeMode} onChange={(v) => onChange({ themeMode: v })} />
          <div style={{ marginTop: 8 }}>
            <Button variant="outline" onClick={() => onChange({ themeMode: 'system' })}>
              Reset to System
            </Button>
          </div>
        </section>
      )}

      <section className="u-card" style={{ marginTop: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>Playback</h2>

        {showAutoplay && (
          <ToggleRow
            id="autoplay"
            label="Autoplay when starting a playlist"
            checked={!!state.autoplay}
            onChange={(v) => onChange({ autoplay: v })}
          />
        )}

        {showExplicit && (
          <ToggleRow
            id="explicit"
            label="Filter explicit content"
            hint="Hide tracks marked as explicit from search and playback."
            checked={!!state.explicitFilter}
            onChange={(v) => onChange({ explicitFilter: v })}
          />
        )}

        {showVolume && (
          <div style={{ marginTop: 12 }}>
            <VolumeInput
              value={state.defaultVolume}
              onChange={(v) => onChange({ defaultVolume: v })}
            />
          </div>
        )}

        {!experimentsEnabled && (
          <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>
            Some experimental settings are hidden because experiments are disabled.
          </div>
        )}
      </section>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <Button onClick={() => setState(loadSettings())} variant="outline">Revert Changes</Button>
        <Button onClick={() => storage.setJson(SETTINGS_KEY, state)}>Save</Button>
      </div>
    </div>
  );
}

function ThemeSelector({ value, onChange }) {
  const nameId = useId();
  const opts = useMemo(
    () => [
      { key: 'system', label: 'System' },
      { key: 'light', label: 'Light' },
      { key: 'dark', label: 'Dark' },
    ],
    []
  );

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend className="sr-only">Theme mode</legend>
      <div role="radiogroup" aria-labelledby={`theme-${nameId}`} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span id={`theme-${nameId}`} className="sr-only">Theme</span>
        {opts.map((o) => {
          const active = o.key === value;
          return (
            <button
              key={o.key}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.key)}
              className="u-interactive"
              style={{
                border: '1px solid ' + (active ? 'rgba(37,99,235,0.35)' : 'var(--border)'),
                background: active ? 'rgba(37,99,235,0.08)' : 'var(--surface)',
                padding: '8px 12px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ToggleRow({ id, label, hint, checked, onChange }) {
  const toggleId = `toggle-${id}`;
  return (
    <div
      className="u-card"
      style={{
        padding: 12,
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 8,
        background: 'var(--surface)',
      }}
    >
      <div>
        <label htmlFor={toggleId} style={{ fontWeight: 700 }}>{label}</label>
        {hint && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</div>}
      </div>
      <button
        id={toggleId}
        role="switch"
        aria-checked={!!checked}
        onClick={() => onChange(!checked)}
        className="u-interactive"
        style={{
          width: 52,
          height: 30,
          borderRadius: 999,
          border: '1px solid var(--border)',
          background: checked ? 'var(--primary)' : 'var(--surface-2)',
          position: 'relative',
          cursor: 'pointer',
        }}
        aria-label={label}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 26 : 3,
            width: 24,
            height: 24,
            background: '#fff',
            borderRadius: '50%',
            boxShadow: 'var(--shadow-sm)',
            transition: 'left var(--transition)',
          }}
        />
      </button>
    </div>
  );
}

function VolumeInput({ value, onChange }) {
  const [local, setLocal] = useState(value ?? 70);
  useEffect(() => {
    setLocal(typeof value === 'number' ? value : 70);
  }, [value]);

  return (
    <div>
      <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Default Volume</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 8, alignItems: 'center' }}>
        <input
          type="range"
          min={0}
          max={100}
          value={local}
          onChange={(e) => setLocal(Number(e.target.value))}
          onBlur={() => onChange(clamp(local, 0, 100))}
          aria-label="Default volume"
          style={{ width: '100%' }}
        />
        <Input
          value={String(local)}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) setLocal(v);
          }}
          onBlur={() => onChange(clamp(local, 0, 100))}
          aria-label="Default volume numeric"
        />
      </div>
      <div style={{ marginTop: 6, color: 'var(--text-muted)', fontSize: 12 }}>
        Applies when starting playback. You can still adjust during listening.
      </div>
    </div>
  );
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, Number(v) || 0));
}

function loadSettings() {
  const saved = storage.getJson(SETTINGS_KEY, null);
  const defaults = {
    themeMode: 'system', // 'system' | 'light' | 'dark'
    autoplay: true,
    explicitFilter: false,
    defaultVolume: 70, // 0-100
  };
  if (!saved) return defaults;
  return {
    themeMode: ['system', 'light', 'dark'].includes(saved.themeMode) ? saved.themeMode : defaults.themeMode,
    autoplay: typeof saved.autoplay === 'boolean' ? saved.autoplay : defaults.autoplay,
    explicitFilter: typeof saved.explicitFilter === 'boolean' ? saved.explicitFilter : defaults.explicitFilter,
    defaultVolume: clamp(saved.defaultVolume, 0, 100),
  };
}

function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'system') {
    // Remove explicit theme; follow system via media query
    root.removeAttribute('data-theme');
    // Optionally set based on current system to initialize colors immediately
    try {
      const m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      if (m && m.matches) root.setAttribute('data-theme', 'dark');
      else root.setAttribute('data-theme', 'light');
      // After a tick, clear to allow CSS to own it; but keeping explicit attr simplifies our CSS variables,
      // so we will keep the attribute set to either 'dark' or 'light' for consistent theming.
    } catch {
      // ignore
    }
    return;
  }
  root.setAttribute('data-theme', mode);
}
