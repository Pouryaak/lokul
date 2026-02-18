import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary] Caught error:", error);
      console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
    }

    this.setState({ errorInfo });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8F0] p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">Something went wrong</h2>

            <p className="mt-2 text-gray-600">
              We apologize for the inconvenience. The application encountered an unexpected error.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mt-4 w-full rounded-lg bg-gray-100 p-4 text-left">
                <p className="font-mono text-sm text-red-600">{this.state.error.message}</p>
                {this.state.errorInfo && (
                  <pre className="mt-2 max-h-32 overflow-auto text-xs text-gray-600">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2 text-white hover:bg-[#FF6B35]/90"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
): React.ComponentType<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
