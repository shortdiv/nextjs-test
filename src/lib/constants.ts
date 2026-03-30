/**
 * Shared app constants (demo coordinates, public feed URLs, etc.).
 */

/** Short label for demos and logs */
export const APP_NAME = "nextjs-test";

/** Fixed map point for local demos — Downtown Brooklyn */
export const DEMO_LOCATION = {
  label: "Downtown Brooklyn",
  latitude: 40.6782,
  longitude: -73.9442,
} as const;

/** Max items shown in paginated lists */
export const DEFAULT_PAGE_SIZE = 25;
