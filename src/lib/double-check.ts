import { sanityCheck } from "./sanity-check";

/** Optional second hook for smoke tests that exercise cross-module imports. */
export function runSmokeChecks(): boolean {
  return sanityCheck().ok === true;
}
