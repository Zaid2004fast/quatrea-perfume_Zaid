"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FRAGRANCES, formatPrice } from "@/lib/fragrances";
import { setWorldUi, world } from "@/lib/world-store";
import { flyTo } from "@/lib/world-control";
import { TLink } from "../shell/TLink";
import { useBag } from "../shell/Providers";
import { Arrow, SeasonMark } from "../brand";

const TONE = ["dark", "dark", "light", "light"] as const;

export function Collection() {
  const [i, setI] = useState(0);
  const [added, setAdded] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const bag = useBag();
  const f = FRAGRANCES[i];

  const go = useCallback((n: number) => setI((n + 4) % 4), []);

  useEffect(() => {
    setWorldUi({ visible: true });
    const mobile = window.matchMedia("(max-width: 820px)").matches;
    flyTo(f.worldT, { frame: mobile ? 0 : 0.42 });
    document.documentElement.dataset.tone = TONE[i];
    setAdded(false);
  }, [i, f.worldT]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.dataset.tone = "dark";
      world.mode = "journey";
    };
  }, [i, go]);

  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    const lines = el.querySelectorAll(".line > span");
    const fades = el.querySelectorAll(".fade");
    const delay = first.current ? 1.1 : 0.55;
    first.current = false;
    const ctx = gsap.context(() => {
      gsap.fromTo(lines, { yPercent: 118 }, { yPercent: 0, duration: 1.4, stagger: 0.08, ease: "expo.out", delay });
      gsap.fromTo(fades, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.06, ease: "expo.out", delay: delay + 0.2 });
    }, el);
    return () => ctx.revert();
  }, [i]);

  return (
    <main className="page collection">
      <div className="collection-panel container-x" ref={panel} key={f.slug}>
        <div className="eyebrow fade coll-eyebrow">
          <SeasonMark active={i} size={14} /> {f.numeral} — {f.frenchSeason} · {f.seasonLabel}
        </div>
        <h1 className="display coll-name">
          <span className="line">
            <span>{f.name}</span>
          </span>
        </h1>
        <p className="display italic coll-tag">
          <span className="line">
            <span>{f.tagline}</span>
          </span>
        </p>
        <p className="body-copy fade">{f.story[0]}</p>
        <dl className="beat-pyramid fade coll-notes">
          {(["top", "heart", "base"] as const).map((k) => (
            <div key={k}>
              <dt className="eyebrow">{k}</dt>
              <dd className="serif">{f.notes[k].map((n) => n.name).join(", ")}</dd>
            </div>
          ))}
        </dl>
        <div className="fade coll-cta">
          <TLink href={`/fragrance/${f.slug}`} className="btn btn-solid">
            Discover {f.name} <Arrow />
          </TLink>
          <button
            className="btn"
            onClick={() => {
              bag.add({ slug: f.slug, size: f.prices[0].size, price: f.prices[0].price });
              setAdded(true);
              bag.setOpen(true);
            }}
          >
            {added ? "Added" : `Add · ${formatPrice(f.prices[0].price)}`}
          </button>
        </div>
      </div>

      <nav className="coll-selector container-x" aria-label="Choose a fragrance">
        <button className="coll-arrow" onClick={() => go(i - 1)} aria-label="Previous fragrance">
          <Arrow className="arrow flip" />
        </button>
        <div className="coll-items">
          {FRAGRANCES.map((x, n) => (
            <button key={x.slug} className="coll-item" data-active={n === i} onClick={() => go(n)} aria-current={n === i}>
              <SeasonMark active={n} size={16} />
              <span className="eyebrow coll-item-n">{x.numeral}</span>
              <span className="serif coll-item-name">{x.name}</span>
              <span className="coll-item-bar" />
            </button>
          ))}
        </div>
        <button className="coll-arrow" onClick={() => go(i + 1)} aria-label="Next fragrance">
          <Arrow className="arrow" />
        </button>
      </nav>
    </main>
  );
}
