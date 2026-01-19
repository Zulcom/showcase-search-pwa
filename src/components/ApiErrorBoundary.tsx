import { Component, type ReactNode, type ErrorInfo } from "react";
import { css } from "../../styled-system/css";

interface ApiErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

interface ApiErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isApiError: boolean;
}

function isApiError(error: Error): boolean {
  const apiErrorPatterns = [
    "rate limit",
    "API",
    "fetch",
    "network",
    "Failed to fetch",
    "NetworkError",
    "TypeError: Failed to fetch",
    "Request failed",
    "HTTP",
  ];
  return apiErrorPatterns.some((pattern) =>
    error.message.toLowerCase().includes(pattern.toLowerCase())
  );
}

export class ApiErrorBoundary extends Component<ApiErrorBoundaryProps, ApiErrorBoundaryState> {
  constructor(props: ApiErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, isApiError: false };
  }

  static getDerivedStateFromError(error: Error): ApiErrorBoundaryState {
    return {
      hasError: true,
      error,
      isApiError: isApiError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ApiErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, isApiError: false });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { error, isApiError } = this.state;

      return (
        <div
          className={css({
            p: "4",
            borderRadius: "lg",
            border: "1px solid",
            borderColor: isApiError ? "yellow.500" : "red.500",
            bg: isApiError ? "yellow.500/10" : "red.500/10",
            textAlign: "center",
          })}
          role="alert"
        >
          <h2
            className={css({
              fontSize: "lg",
              fontWeight: "semibold",
              color: isApiError ? "yellow.700" : "red.600",
              mb: "2",
            })}
          >
            {isApiError ? "API Error" : "Something went wrong"}
          </h2>
          <p
            className={css({
              color: "text.muted",
              mb: "4",
              fontSize: "sm",
            })}
          >
            {error?.message || "An unexpected error occurred"}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className={css({
              px: "4",
              py: "2",
              bg: isApiError ? "yellow.500" : "red.500",
              color: isApiError ? "black" : "white",
              borderRadius: "md",
              border: "none",
              cursor: "pointer",
              fontWeight: "medium",
              transition: "all 0.2s",
              _hover: {
                bg: isApiError ? "yellow.600" : "red.600",
              },
            })}
          >
            {isApiError ? "Retry API Call" : "Try again"}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
