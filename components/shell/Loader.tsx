"use client";
import { useProgress } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useWorldUi } from "@/lib/world-store";
import { SeasonMark, Wordmark } from "../brand";

/** First-visit loader. Holds the curtain until the world is compiled, so the journey never pops in. */
export function Loader() {
  const { progress } = useProgress();
  const { ready, visible } = useWorldUi();
  const [done, setDone] = useState(false);
  const [shown, setShown] = useState(0);
  const start = useRef(0);

  useEffect(() => {
    start.current = performance.now();
    const fallback = setTimeout(() => {
      setDone(true);
      (window as unknown as { __quatreaReady?: boolean }).__quatreaReady = true;
      window.dispatchEvent(new Event("quatrea:ready"));
    }, 20000);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (done) return;
    let raf = 0;
    const loop = () => {
      setShown((s) => {
        const target = ready ? 100 : Math.min(progress, 96);
        return s + (target - s) * 0.08;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [progress, ready, done]);

  const scheduled = useRef(false);
  useEffect(() => {
    if (done || scheduled.current || !(ready || !visible)) return;
    scheduled.current = true;
    const wait = Math.max(0, 1400 - (performance.now() - start.current));
    setTimeout(() => {
      setDone(true);
      (window as unknown as { __quatreaReady?: boolean }).__quatreaReady = true;
      window.dispatchEvent(new Event("quatrea:ready"));
    }, wait + 650);
  }, [ready, visible, done]);

  const quarter = Math.min(3, Math.floor(shown / 25));
  return (
    <div className="loader" data-done={done} aria-hidden={done}>
      <div style={{ display: "grid", justifyItems: "center", gap: "2.2rem" }}>
        <SeasonMark active={quarter} size={58} />
        <Wordmark style={{ fontSize: "1.25rem" }} />
        <div style={{ width: "min(240px, 60vw)", height: 1, background: "rgba(21,18,15,.15)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "#a8875a", transformOrigin: "left", transform: `scaleX(${shown / 100})` }} />
        </div>
        <div className="eyebrow" style={{ opacity: 0.55, fontVariantNumeric: "tabular-nums" }}>
          {["Printemps", "Été", "Automne", "Hiver"][quarter]} — {Math.round(shown)}%
        </div>
      </div>
    </div>
  );
}
