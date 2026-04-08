import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="survey-shell">
          <div className="survey-frame">
            <div className="question-page">
              <h1 className="question-title">Something went wrong</h1>
              <p className="question-subtitle">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <div className="action-row">
                <button
                  className="ok-btn"
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
