"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// Browser-only defaults are applied after hydration without mismatching server HTML.
export function useBrowser() {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
