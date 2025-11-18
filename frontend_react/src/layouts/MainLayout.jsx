import React, { useState } from 'react';
import TopNav from '../components/TopNav';
import Sidebar from '../components/Sidebar';
import PlayerBar from '../components/PlayerBar';
import '../styles/theme.css';

/**
 * PUBLIC_INTERFACE
 * MainLayout: Provides the shell for the app with TopNav, Sidebar, main content outlet,
 * and sticky PlayerBar. Handles responsive sidebar collapse.
 */
export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`layout-root ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <TopNav onMenuToggle={toggleSidebar} />
      <div className="layout-body">
        <Sidebar isOpen={sidebarOpen} onLinkClick={closeSidebar} />
        <main className="layout-content" role="main" aria-live="polite">
          {children}
        </main>
      </div>
      <PlayerBar />
    </div>
  );
}
