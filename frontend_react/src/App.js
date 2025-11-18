import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AppRouter from './routes/AppRouter';

/**
 * PUBLIC_INTERFACE
 * App: Root component wiring Router and MainLayout.
 * Provides the application shell for all pages.
 */
function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <AppRouter />
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
