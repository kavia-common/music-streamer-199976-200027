import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ErrorBoundary component that catches runtime errors in the React component tree.
 * Provides a user-friendly, accessible fallback UI with options to retry or go home.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can integrate with a logging service here.
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
    this.setState({ info });
  }

  handleReset = () => {
    // Reset local error state
    this.setState({ hasError: false, error: null, info: null });
    // If a reset callback is provided, call it (useful for refetching)
    if (typeof this.props.onReset === 'function') {
      try {
        this.props.onReset();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary onReset failed:', e);
      }
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const bgGradient = 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(249,250,251,1) 100%)';

    return (
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: bgGradient
        }}
      >
        <div
          style={{
            maxWidth: 720,
            width: '100%',
            background: '#ffffff',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid rgba(17,24,39,0.06)',
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}
          >
            <div
              aria-hidden="true"
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 48,
                height: 48,
                borderRadius: 8,
                background: 'rgba(239,68,68,0.1)',
                color: '#EF4444',
                flexShrink: 0
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  lineHeight: 1.4,
                  color: '#111827',
                  fontWeight: 700
                }}
              >
                Something went wrong
              </h2>
              <p style={{ margin: '0.5rem 0 0', color: '#374151' }}>
                We encountered an unexpected error while rendering this section. You can try again or head back to the home page.
              </p>

              {this.state.error ? (
                <details style={{ marginTop: '0.75rem', background: '#F9FAFB', borderRadius: 8, padding: '0.75rem', border: '1px solid rgba(17,24,39,0.06)' }}>
                  <summary style={{ cursor: 'pointer', color: '#2563EB', fontWeight: 600 }}>Error details</summary>
                  <pre
                    aria-label="Error message"
                    style={{
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace',
                      color: '#B91C1C',
                      marginTop: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
{String(this.state.error?.message || this.state.error).slice(0, 2000)}
                  </pre>
                  {this.state.info?.componentStack ? (
                    <pre
                      aria-label="Component stack"
                      style={{
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace',
                        color: '#6B7280',
                        marginTop: '0.5rem',
                        fontSize: '0.8rem'
                      }}
                    >
{this.state.info.componentStack.slice(0, 4000)}
                    </pre>
                  ) : null}
                </details>
              ) : null}

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={this.handleReset}
                  type="button"
                  aria-label="Try to render this section again"
                  style={{
                    background: '#2563EB',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 0.9rem',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    boxShadow: '0 6px 14px rgba(37,99,235,0.25)'
                  }}
                >
                  Try again
                </button>
                <a
                  href="/"
                  aria-label="Go back to home page"
                  style={{
                    background: '#ffffff',
                    color: '#2563EB',
                    border: '1px solid rgba(37,99,235,0.25)',
                    padding: '0.55rem 0.9rem',
                    borderRadius: 8,
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  Go home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
