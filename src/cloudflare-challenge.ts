import { isBrowserEnv } from "./utils";

/**
 * Some API endpoints on the cache proxy (e.g. the live games) are behind a Cloudflare challenge.
 * The challenge is also on the page itself, so a full page load shows it to the user and sets the
 * cf_clearance cookie which the API requests then send with `credentials: "include"`.
 *
 * When the user gets to the page via client side navigation, or the clearance expires while the page
 * is open, the API request gets the challenge instead. Cloudflare's challenge response doesn't have
 * CORS headers, so in the browser it shows up as a failed fetch (TypeError) - not as a 403.
 * In that case we reload the page once, which shows the challenge.
 */

const RELOAD_KEY = "cf-challenge-reload-at";
// Don't reload again if we already did recently - the request is failing for a different reason.
const RELOAD_COOLDOWN_MS = 60 * 1000;

export const isBlockedByChallenge = (e: unknown): boolean => {
  if (!(e instanceof TypeError)) return false;
  // A failed fetch while offline is not the challenge.
  return typeof navigator === "undefined" || navigator.onLine !== false;
};

/**
 * Reloads the page if the error looks like the Cloudflare challenge and we haven't reloaded
 * in the last minute. Returns true when the reload was triggered.
 */
export const reloadIfBlockedByChallenge = (
  e: unknown,
  reload = () => window.location.reload(),
): boolean => {
  if (!isBrowserEnv() || !isBlockedByChallenge(e)) return false;

  try {
    const lastReload = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - lastReload < RELOAD_COOLDOWN_MS) return false;
    window.sessionStorage.setItem(RELOAD_KEY, `${Date.now()}`);
  } catch {
    // Without the storage we can't guard against a reload loop
    return false;
  }

  reload();
  return true;
};
