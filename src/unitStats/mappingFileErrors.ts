/** HTTP errors can be wrapped by both the request and JSON-loading layers. */
export const isMissingMappingFile = (error: unknown): boolean => {
  const visited = new Set<unknown>();
  let current = error;
  while (current && typeof current === "object" && !visited.has(current)) {
    visited.add(current);
    const failure = current as {
      response?: { status?: number };
      cause?: unknown;
    };
    if (failure.response?.status === 404) return true;
    current = failure.cause;
  }
  return false;
};
