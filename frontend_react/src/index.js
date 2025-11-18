import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './state/authContext.jsx';
import { PlayerProvider } from './state/playerStore';
import { storage } from './utils/storage';

function Boot() {
  // Apply persisted settings on initial boot (theme and default volume hint)
  useEffect(() => {
    const settings = storage.getJson('app.settings.v1', null);
    const mode = settings?.themeMode || 'system';
    const root = document.documentElement;
    if (mode === 'dark') root.setAttribute('data-theme', 'dark');
    else if (mode === 'light') root.setAttribute('data-theme', 'light');
    else {
      // system
      try {
        const m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        if (m && m.matches) root.setAttribute('data-theme', 'dark');
        else root.setAttribute('data-theme', 'light');
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <AuthProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </AuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Boot />
  </React.StrictMode>
);
