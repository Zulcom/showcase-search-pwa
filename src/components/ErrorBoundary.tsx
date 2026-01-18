import { Component, type ReactNode } from "react";
import { css } from "../../styled-system/css";
import { logger } from "../lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("ErrorBoundary caught an error", { error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className={css({
            p: "6",
            bg: "red.500/10",
            border: "1px solid",
            borderColor: "red.500/30",
            borderRadius: "lg",
            textAlign: "center",
          })}
        >
          <h2
            className={css({
              fontSize: "lg",
              fontWeight: "semibold",
              color: "red.500",
              mb: "2",
            })}
          >
            Something went wrong
          </h2>
          <p
            className={css({
              color: "text.muted",
              mb: "4",
            })}
          >
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className={css({
              px: "4",
              py: "2",
              bg: "red.500",
              color: "white",
              border: "none",
              borderRadius: "md",
              cursor: "pointer",
              fontWeight: "medium",
              transition: "background-color 0.2s",
              _hover: {
                bg: "red.600",
              },
            })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
