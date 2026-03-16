import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to console for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 border border-danger rounded bg-light">
          <div className="d-flex align-items-center mb-3">
            <div className="text-danger me-3">
              <i className="bi bi-exclamation-triangle-fill fs-1"></i>
            </div>
            <div>
              <h5 className="mb-1 text-danger">Something went wrong</h5>
              <p className="mb-0 text-muted">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={this.handleRetry}
            >
              Try Again
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-3">
              <summary className="text-muted small">Error Details (Development)</summary>
              <pre className="mt-2 p-2 bg-dark text-light small rounded">
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;