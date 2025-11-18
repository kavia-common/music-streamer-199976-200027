import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AppRouter from './routes/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * PUBLIC_INTERFACE
 * App: Root component wiring Router and MainLayout.
 * Wraps content with ErrorBoundary to provide robust runtime error handling.
 */
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <MainLayout>
          <AppRouter />
        </MainLayout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
