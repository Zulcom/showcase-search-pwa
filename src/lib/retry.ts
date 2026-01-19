import pRetry, { AbortError, type Options } from "p-retry";
import { logger } from "./logger";
import { config } from "./config";

const PERMANENT_ERROR_CODES = new Set([400, 401, 403, 404, 422]);

const TRANSIENT_ERROR_CODES = new Set([408, 429, 500, 502, 503, 504]);

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "HttpError";
  }

  get isTransient(): boolean {
    return TRANSIENT_ERROR_CODES.has(this.status);
  }

  get isPermanent(): boolean {
    return PERMANENT_ERROR_CODES.has(this.status);
  }
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof Error && error.name === "AbortError") {
    return false;
  }

  if (error instanceof HttpError && error.isPermanent) {
    return false;
  }

  if (error instanceof HttpError && error.isTransient) {
    return true;
  }

  if (error instanceof TypeError) {
    return true;
  }

  return true;
}

const DEFAULT_OPTIONS: Options = {
  retries: config.retry.count,
  minTimeout: config.retry.minTimeoutMs,
  maxTimeout: config.retry.maxTimeoutMs,
  shouldRetry,
  onFailedAttempt: (error) => {
    logger.warn(
      `Request failed (attempt ${error.attemptNumber}/${error.retriesLeft + error.attemptNumber})`,
      error.message
    );
  },
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<Options> = {}
): Promise<T> {
  return pRetry(fn, { ...DEFAULT_OPTIONS, ...options });
}

export { AbortError };
