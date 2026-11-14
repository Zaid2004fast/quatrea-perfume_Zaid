"use client";
import { useEffect } from "react";
import { setWorldUi, world } from "@/lib/world-store";
import { flyTo } from "@/lib/world-control";

/** Declares, per page, what the persistent world should be doing. */
export function WorldDirector({ mode, t = 0, frame = 0, tone }: { mode: "focus" | "hidden" | "journey"; t?: number; frame?: number; tone?: "light" | "dark" }) {
  useEffect(() => {
    if (mode === "hidden") {
      setWorldUi({ visible: false });
    } else {
      setWorldUi({ visible: true });
      if (mode === "focus") flyTo(t, { frame });
      else world.mode = "journey";
    }
    if (tone) document.documentElement.dataset.tone = tone;
  }, [mode, t, frame, tone]);
  return null;
}
