// Top-level error boundary. Catches any uncaught render error from children
// and shows a friendly fallback instead of a white screen.
//
// We use a class component because React hooks cannot catch render-phase
// errors. This is the one place in the app where a class component is the
// right tool.

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error("[ErrorBoundary] caught:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="grid h-full place-items-center px-6 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-2xl font-semibold">
            Something went wrong.
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Reload the page to try again. If it keeps happening, the data file
            may be corrupted.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-4 rounded-chip border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
