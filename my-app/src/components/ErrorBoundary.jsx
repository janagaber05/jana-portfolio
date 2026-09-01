import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Portfolio] Render error:', error, info);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          background: '#FCF4F0',
          color: '#1A1A1A',
          fontFamily: 'Inter, sans-serif',
        }}
        >
          <div style={{ maxWidth: '36rem' }}>
            <h1 style={{ marginBottom: '0.75rem' }}>Something went wrong</h1>
            <p style={{ marginBottom: '1rem', opacity: 0.75 }}>
              The portfolio hit a runtime error. Try a hard refresh. If it keeps happening, share this message.
            </p>
            <pre style={{
              whiteSpace: 'pre-wrap',
              background: '#fff',
              border: '1px solid rgba(109,1,1,0.15)',
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.85rem',
            }}
            >
              {error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
