"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hook to detect if the component has been hydrated on the client.
 * Uses useSyncExternalStore for proper React 18+ hydration detection.
 *
 * This is useful for:
 * - Preventing hydration mismatch with localStorage-based stores (Zustand)
 * - Conditionally rendering client-only content
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client: always return true after hydration
    () => false  // Server: always return false
  );
}
