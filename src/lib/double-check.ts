import { sanityCheck } from "./sanity-check";

/** Optional second hook for smoke tests that exercise cross-module imports. */
export function runSmokeChecks(): boolean {
  return sanityCheck().ok === true;
}

/** Returns a human-readable summary of all smoke check results. */
export function smokeCheckSummary(): string {
  const passed = runSmokeChecks();
  return passed ? "All checks passed" : "Some checks failed";
}
