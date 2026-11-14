"use client";
import gsap from "gsap";
import { world } from "./world-store";

let flight: gsap.core.Tween | null = null;

/** Fly the camera through the year to a given journey time. Long distances take longer, like real travel. */
export function flyTo(t: number, opts: { frame?: number; duration?: number; mode?: "focus" | "journey" } = {}) {
  world.mode = opts.mode ?? "focus";
  world.targetFrame = opts.frame ?? 0;
  world.follow = 6;
  flight?.kill();
  const distance = Math.abs(world.targetT - t);
  const duration = world.reducedMotion ? 0.01 : opts.duration ?? Math.min(1.2 + distance * 4.2, 4.4);
  flight = gsap.to(world, { targetT: t, duration, ease: "power2.inOut", onComplete: () => (flight = null) });
  return flight;
}

export function killFlight() {
  flight?.kill();
  flight = null;
}

export function isFlying() {
  return !!flight;
}
