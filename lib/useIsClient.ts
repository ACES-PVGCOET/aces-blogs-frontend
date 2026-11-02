"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during server rendering and hydration, true once the page is
 * interactive in the browser. Used to read browser-only state
 * (localStorage) without a hydration mismatch.
 */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
