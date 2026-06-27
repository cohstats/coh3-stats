/**
 * Enhanced axios wrapper that provides better error handling and logging
 * for data fetching operations, especially useful during build time.
 */

import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";

const TIMEOUT_MS = 100000; // 100s, the data packages are extremely heavy - CF has limit 100s for GET
const MAX_RETRIES = 2;

// Create axios instance with timeout configuration
const axiosInstance = axios.create({
  timeout: TIMEOUT_MS,
});

// Configure axios-retry for automatic retries with exponential backoff
axiosRetry(axiosInstance, {
  retries: MAX_RETRIES,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Don't retry on 4xx/5xx errors
    if (error.response?.status && error.response.status >= 400) {
      return false;
    }
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
  onRetry: (retryCount, error, requestConfig) => {
    const context = (requestConfig as any).context || "unknown";
    const url = requestConfig.url || "unknown";
    const attemptMsg = ` (Attempt ${retryCount}/${MAX_RETRIES}, will retry)`;
    const errorMessage = error.message || String(error);

    console.error(
      `[Axios Exception] Failed to fetch ${context}${attemptMsg}. URL: ${url}, Error: ${errorMessage}`,
    );
  },
});

/**
 * Fetch with enhanced error handling and logging using axios
 * @param url - The URL to fetch
 * @param context - A human-readable context for the fetch operation (e.g., "weapon.json", "ebps.json for patch 1.5.0")
 * @returns Promise<AxiosResponse>
 * @throws Error with detailed information about what failed
 */
export const fetchMappingsWithLogs = async (
  url: string,
  context: string,
): Promise<AxiosResponse> => {
  try {
    // const attemptMsg = attempt > 1 ? ` (Attempt ${attempt}/${MAX_RETRIES})` : '';
    // console.log(`[Axios] Starting: ${context} from ${url}${attemptMsg}`);

    const response = await axiosInstance.get(url, {
      // Store context in config for retry handler
      context,
    } as any);

    // console.log(`[Axios] Success: ${context}`);
    return response;
  } catch (error: any) {
    const errorMessage = error.message || String(error);

    // Handle axios error responses
    if (error.response) {
      const errorMsg = `Failed to fetch ${context}. URL: ${url}, Status: ${error.response.status} ${error.response.statusText || ""}`;
      console.error(`[Axios Error] ${errorMsg}`);
      console.error(`[Axios Exception Details]`, error);

      throw new Error(errorMsg);
    }

    // Handle other errors (network, timeout, etc.)
    console.error(
      `[Axios Exception] Failed to fetch ${context}. URL: ${url}, Error: ${errorMessage}`,
    );
    console.error(`[Axios Exception Details]`, error);

    // Log the cause if it exists
    if (error.cause) {
      console.error(`[Axios Exception Cause]`, error.cause);
    }

    throw new Error(`Failed to fetch ${context}. URL: ${url}, Error: ${errorMessage}`);
  }
};

/**
 * Fetch JSON with enhanced error handling and logging
 * @param url - The URL to fetch
 * @param context - A human-readable context for the fetch operation
 * @returns Promise<any> - The parsed JSON response
 * @throws Error with detailed information about what failed
 */
export const fetchJsonWithLogging = async (url: string, context: string): Promise<any> => {
  try {
    const response = await fetchMappingsWithLogs(url, context);
    // console.log(`[Axios] Successfully parsed JSON for: ${context}`);
    return response.data;
  } catch (error) {
    const errorMsg = `Failed to parse JSON for ${context}. URL: ${url}, Error: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`[Axios Parse Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }
};
