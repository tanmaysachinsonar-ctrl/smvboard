import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log to monitoring service (Sentry, etc.)
    if (typeof window !== 'undefined') {
      // You can integrate Sentry or other error tracking here
      console.error('Component stack:', errorInfo.componentStack);
    }

    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-smvbg flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-8 max-w-2xl w-full">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Etwas ist schiefgelaufen</h1>
            <p className="text-gray-400 mb-4">
              Ein unerwarteter Fehler ist aufgetreten. Bitte laden Sie die Seite neu oder
              kontaktieren Sie den Support.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                  Technische Details anzeigen
                </summary>
                <pre className="mt-2 p-4 bg-smvbg rounded text-xs text-red-400 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition"
              >
                Seite neu laden
              </button>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
              >
                Zum Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
