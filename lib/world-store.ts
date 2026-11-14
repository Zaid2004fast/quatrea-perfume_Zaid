"use client";
import { useSyncExternalStore } from "react";

/**
 * The persistent WebGL world is driven by a single mutable store so that
 * scroll and camera updates never trigger React renders. Only coarse UI state
 * (visibility, ready) is exposed reactively.
 */
export type WorldMode = "journey" | "focus";

export const world = {
  /** Smoothed journey time actually rendered (0–1). */
  t: 0,
  /** Where the camera is heading. */
  targetT: 0,
  /** How quickly t follows targetT (per second). */
  follow: 3.2,
  mode: "journey" as WorldMode,
  /** Horizontal composition shift: -1 puts the subject left, +1 right. 0 = centred. */
  frame: 0,
  targetFrame: 0,
  /** 0 = full scene, 1 = fully veiled by page content. */
  veil: 0,
  visible: true,
  pointer: { x: 0, y: 0 },
  reducedMotion: false,
  mobile: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();
let snapshot = { visible: true, ready: false };

export function setWorldUi(patch: Partial<typeof snapshot>) {
  snapshot = { ...snapshot, ...patch };
  if (patch.visible !== undefined) world.visible = patch.visible;
  listeners.forEach((l) => l());
}

export function useWorldUi() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
    () => snapshot,
  );
}
