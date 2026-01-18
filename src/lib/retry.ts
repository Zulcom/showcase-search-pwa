import pRetry, { type Options } from "p-retry";
import { logger } from "./logger";

const DEFAULT_OPTIONS: Options = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 10000,
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
