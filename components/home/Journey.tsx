"use client";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FRAGRANCES, formatPrice, type Fragrance } from "@/lib/fragrances";
import { world, setWorldUi } from "@/lib/world-store";
import { flyTo, killFlight } from "@/lib/world-control";
import { TLink } from "../shell/TLink";
import { useLenis } from "../shell/Providers";
import { Arrow, SeasonMark } from "../brand";

const L = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <span className={`line ${className}`}>
    <span>{children}</span>
  </span>
);

type Side = "left" | "right" | "center" | "top";
interface Beat {
  id: string;
  in: number;
  out: number;
  side: Side;
  content: ReactNode;
}

const ACTS = [
  { label: "Arrival", fr: "L’arrivée", from: 0, season: -1 },
  { label: "Spring", fr: "Printemps", from: 0.14, season: 0 },
  { label: "Summer", fr: "Été", from: 0.345, season: 1 },
  { label: "Autumn", fr: "Automne", from: 0.565, season: 2 },
  { label: "Winter", fr: "Hiver", from: 0.785, season: 3 },
  { label: "The Year", fr: "L’année", from: 0.948, season: 4 },
];
const actAt = (p: number) => ACTS.reduce((a, act, i) => (p >= act.from ? i : a), 0);
/** The opening title plays once per visit, not on every return to the home page. */
let introSeen = false;
const toneAt = (p: number) => (p > 0.552 && p < 0.948 ? "light" : "dark");

function Intro({ f }: { f: Fragrance }) {
  return (
    <>
      <div className="eyebrow fade beat-eyebrow">
        <SeasonMark active={f.index} size={14} /> {f.numeral} — {f.frenchSeason} · {f.seasonLabel}
      </div>
      <h2 className="display beat-name">
        <L>{f.name}</L>
      </h2>
      <p className="display italic beat-tagline">
        <L>{f.tagline}</L>
      </p>
      <p className="eyebrow fade beat-notes">
        {[...f.notes.top, ...f.notes.heart, ...f.notes.base].map((n) => n.name).join("  ·  ")}
      </p>
    </>
  );
}

function Composition({ f }: { f: Fragrance }) {
  const rows: [string, string][] = [
    ["Top", f.notes.top.map((n) => n.name).join(", ")],
    ["Heart", f.notes.heart.map((n) => n.name).join(", ")],
    ["Base", f.notes.base.map((n) => n.name).join(", ")],
  ];
  return (
    <>
      <div className="eyebrow fade">The composition</div>
      <p className="display beat-theme">
        <L>{f.stateOfBeing}.</L>
      </p>
      <dl className="beat-pyramid">
        {rows.map(([k, v]) => (
          <div key={k} className="fade">
            <dt className="eyebrow">{k}</dt>
            <dd className="serif">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="fade beat-cta">
        <TLink href={`/fragrance/${f.slug}`} className="btn">
          Discover {f.name} <Arrow />
        </TLink>
        <span className="eyebrow" style={{ opacity: 0.7 }}>
          Eau de parfum · {formatPrice(f.prices[0].price)}
        </span>
      </div>
    </>
  );
}

const [SP, SU, AU, WI] = FRAGRANCES;
const BEATS: Beat[] = [
  {
    id: "hero",
    in: 0,
    out: 0.06,
    side: "left",
    content: (
      <>
        <div className="eyebrow fade hero-eyebrow">Maison de parfum · Collection Quatre Saisons</div>
        <h1 className="display hero-title">
          <L>Four seasons.</L>
          <L>
            <em>One essence.</em>
          </L>
        </h1>
        <p className="body-copy fade hero-copy">
          Quatréa composes the year in four fragrances — each one a world to step into, and a state of being to wear.
        </p>
        <div className="fade scroll-cue">
          <span className="scroll-cue-line" />
          <span className="eyebrow">Scroll to begin the year</span>
        </div>
      </>
    ),
  },
  {
    id: "dive",
    in: 0.096,
    out: 0.142,
    side: "center",
    content: (
      <p className="display interlude">
        <L>Every year begins</L>
        <L>
          <em>with a single breath.</em>
        </L>
      </p>
    ),
  },
  { id: "spring-a", in: 0.165, out: 0.258, side: "right", content: <Intro f={SP} /> },
  { id: "spring-b", in: 0.272, out: 0.318, side: "left", content: <Composition f={SP} /> },
  {
    id: "haze-1",
    in: 0.333,
    out: 0.366,
    side: "center",
    content: (
      <p className="display interlude">
        <L>Light gathers</L>
        <L>
          <em>on the water.</em>
        </L>
      </p>
    ),
  },
  { id: "summer-a", in: 0.38, out: 0.478, side: "left", content: <Intro f={SU} /> },
  { id: "summer-b", in: 0.493, out: 0.538, side: "right", content: <Composition f={SU} /> },
  {
    id: "haze-2",
    in: 0.553,
    out: 0.586,
    side: "center",
    content: (
      <p className="display interlude">
        <L>The light turns</L>
        <L>
          <em>to amber.</em>
        </L>
      </p>
    ),
  },
  { id: "autumn-a", in: 0.6, out: 0.698, side: "right", content: <Intro f={AU} /> },
  { id: "autumn-b", in: 0.712, out: 0.758, side: "left", content: <Composition f={AU} /> },
  {
    id: "haze-3",
    in: 0.773,
    out: 0.804,
    side: "center",
    content: (
      <p className="display interlude">
        <L>And then,</L>
        <L>
          <em>silence.</em>
        </L>
      </p>
    ),
  },
  { id: "winter-a", in: 0.818, out: 0.882, side: "left", content: <Intro f={WI} /> },
  { id: "winter-b", in: 0.892, out: 0.934, side: "right", content: <Composition f={WI} /> },
  {
    id: "finale",
    in: 0.962,
    out: 1.2,
    side: "top",
    content: (
      <>
        <div className="eyebrow fade">The collection · Quatre saisons</div>
        <h2 className="display finale-title">
          <L>A year</L>
          <L>
            <em>you can wear.</em>
          </L>
        </h2>
        <div className="fade finale-cta">
          <TLink href="/collection" className="btn btn-solid">
            Explore the collection <Arrow />
          </TLink>
          <TLink href="/discover" className="btn">
            Find your season
          </TLink>
        </div>
      </>
    ),
  },
];

export function Journey() {
  const track = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const [act, setAct] = useState(0);
  const lenis = useLenis();

  // Arrive: fly from wherever the camera is back to the start of the year.
  useEffect(() => {
    setWorldUi({ visible: true });
    world.mode = "journey";
    world.targetFrame = 0;
    if (Math.abs(world.t) > 0.002) flyTo(0, { mode: "journey" });
    document.documentElement.dataset.tone = "dark";
    return () => {
      document.documentElement.dataset.tone = "dark";
    };
  }, []);

  useLayoutEffect(() => {
    const root = overlay.current!;
    let safety = 0;
    const ctx = gsap.context(() => {
      const beats = gsap.utils.toArray<HTMLElement>(".beat", root);
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      tl.set({}, {}, 1);

      beats.forEach((el) => {
        const b = BEATS.find((x) => x.id === el.dataset.id)!;
        const lines = el.querySelectorAll(".line > span");
        const fades = el.querySelectorAll(".fade");
        if (b.id === "hero") {
          // the hero intro plays on load; the scroll only takes it away
          tl.fromTo(lines, { yPercent: 0 }, { yPercent: -118, duration: 0.024, stagger: 0.004, ease: "power2.in", immediateRender: false }, 0.034);
          tl.fromTo(fades, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, duration: 0.02, stagger: 0.002, immediateRender: false }, 0.03);
          tl.set(el, { autoAlpha: 0 }, b.out);
          return;
        }
        gsap.set(el, { autoAlpha: 0 });
        tl.set(el, { autoAlpha: 1 }, b.in);
        tl.fromTo(lines, { yPercent: 118 }, { yPercent: 0, duration: 0.024, stagger: 0.005, ease: "power3.out" }, b.in);
        if (fades.length) tl.fromTo(fades, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.02, stagger: 0.003, ease: "power2.out" }, b.in + 0.008);
        if (b.out <= 1) {
          tl.to(lines, { yPercent: -118, duration: 0.016, stagger: 0.003, ease: "power2.in" }, b.out - 0.02);
          if (fades.length) tl.to(fades, { autoAlpha: 0, y: -16, duration: 0.012, ease: "power1.in" }, b.out - 0.018);
          tl.set(el, { autoAlpha: 0 }, b.out);
        }
      });

      let lastAct = -1;
      let lastTone = "";
      ScrollTrigger.create({
        trigger: track.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        animation: tl,

        onUpdate: (self) => {
          killFlight();
          world.mode = "journey";
          world.follow = 2.6;
          world.targetT = self.progress;
          const a = actAt(self.progress);
          if (a !== lastAct) {
            lastAct = a;
            setAct(a);
          }
          const tone = toneAt(self.progress);
          if (tone !== lastTone) {
            lastTone = tone;
            document.documentElement.dataset.tone = tone;
          }
          if (bar.current) bar.current.style.transform = `scaleY(${self.progress})`;
          if (pct.current) pct.current.textContent = String(Math.round(self.progress * 100)).padStart(2, "0");
        },
      });

      ScrollTrigger.create({
        trigger: document.querySelector(".epilogue-body"),
        start: "top 70%",
        onEnter: () => document.body.classList.add("journey-done"),
        onLeaveBack: () => document.body.classList.remove("journey-done"),
      });

      // Hero intro on first reveal
      const heroLines = root.querySelectorAll('[data-id="hero"] .line > span');
      const heroFades = root.querySelectorAll('[data-id="hero"] .fade');
      gsap.set(heroLines, { yPercent: 118 });
      gsap.set(heroFades, { autoAlpha: 0, y: 24 });
      const intro = introRef.current;
      let played = false;
      const showHero = (delay = 0) =>
        gsap
          .timeline({ delay })
          .to(heroLines, { yPercent: 0, duration: 1.6, stagger: 0.12, ease: "expo.out" })
          .to(heroFades, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" }, 0.4);
      const play = () => {
        if (played) return;
        played = true;
        if (!intro || introSeen || window.scrollY > 40) {
          if (intro) gsap.set(intro, { autoAlpha: 0 });
          showHero(0.2);
          return;
        }
        introSeen = true;
        // the opening title: the season mark is drawn, the name is written, then the world is revealed
        const circle = intro.querySelector("circle")!;
        const strokes = intro.querySelectorAll(".stroke");
        const quads = intro.querySelectorAll(".q");
        const letters = intro.querySelectorAll(".intro-word span");
        const line = intro.querySelector(".intro-line span");
        const len = 2 * Math.PI * 50;
        gsap.set(circle, { strokeDasharray: len, strokeDashoffset: len });
        strokes.forEach((s) => {
          const l = (s as SVGPathElement).getTotalLength();
          gsap.set(s, { strokeDasharray: l, strokeDashoffset: l });
        });
        const tl = gsap.timeline({ delay: 0.25 });
        tl.set(intro, { autoAlpha: 1 })
          .to(circle, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" })
          .to(strokes, { strokeDashoffset: 0, duration: 0.7, stagger: 0.15, ease: "power2.out" }, 0.9);
        quads.forEach((q, i) => {
          tl.to(q, { opacity: 1, duration: 0.22, ease: "power1.out" }, 1.45 + i * 0.22);
          if (i < 3) tl.to(q, { opacity: 0, duration: 0.22, ease: "power1.in" }, 1.67 + i * 0.22);
        });
        tl.fromTo(letters, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.07, ease: "expo.out" }, 1.4)
          .fromTo(line, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.3, ease: "power2.inOut" }, 2.1)
          .to(intro, { autoAlpha: 0, scale: 1.04, duration: 1.1, ease: "power2.inOut" }, 3.7)
          .add(() => {
            showHero();
          }, 3.95);
        const skip = () => {
          if (tl.progress() < 0.95) tl.progress(1);
        };
        window.addEventListener("wheel", skip, { once: true, passive: true });
        window.addEventListener("touchstart", skip, { once: true, passive: true });
        window.addEventListener("keydown", skip, { once: true });
      };
      if ((window as unknown as { __quatreaReady?: boolean }).__quatreaReady) play();
      else window.addEventListener("quatrea:ready", play, { once: true });
      // never leave the opening empty: if the ready signal is ever missed, start once the loader has lifted
      safety = window.setInterval(() => {
        if (played) return clearInterval(safety);
        if (!document.querySelector('.loader:not([data-done="true"])')) play();
      }, 400);
    }, root);
    return () => {
      clearInterval(safety);
      ctx.revert();
      document.body.classList.remove("journey-done");
    };
  }, []);

  const jump = (t: number) => {
    const el = track.current;
    if (!el) return;
    const y = el.offsetTop + t * (el.offsetHeight - window.innerHeight);
    if (lenis) lenis.scrollTo(y, { duration: 2.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const current = ACTS[act];
  return (
    <>
      <div ref={introRef} className="intro" aria-hidden style={{ opacity: 0, visibility: "hidden" }}>
        <div className="intro-inner">
          <svg viewBox="0 0 120 120" className="intro-mark">
            {["M60 60 L60 10 A50 50 0 0 0 10 60 Z", "M60 60 L110 60 A50 50 0 0 0 60 10 Z", "M60 60 L60 110 A50 50 0 0 0 110 60 Z", "M60 60 L10 60 A50 50 0 0 0 60 110 Z"].map((d) => (
              <path key={d} d={d} className="q" fill="currentColor" opacity={0} />
            ))}
            <circle cx="60" cy="60" r="50" />
            <path className="stroke" d="M10 60 H110" />
            <path className="stroke" d="M60 10 V110" />
          </svg>
          <div className="intro-word">
            {"QUATRÉA".split("").map((ch, i) => (
              <span key={i}>{ch}</span>
            ))}
          </div>
          <div className="intro-line">
            <span>Four seasons. Four states of being.</span>
          </div>
        </div>
        <span className="eyebrow intro-skip">Scroll to begin</span>
      </div>
      <div ref={track} className="journey-track" />
      <div ref={overlay} className="journey-overlay">
        {BEATS.map((b) => (
          <section key={b.id} data-id={b.id} className={`beat beat-${b.side}`} aria-label={b.id}>
            <div className="beat-inner">{b.content}</div>
          </section>
        ))}
      </div>

      <div className="hud">
        <div className="hud-season">
          <SeasonMark active={current.season} fillAll={current.season === 4} size={30} />
          <div>
            <div className="eyebrow" style={{ opacity: 0.6 }}>
              {String(act).padStart(2, "0")} / 05
            </div>
            <div className="serif hud-label" key={current.fr}>
              {current.fr}
            </div>
          </div>
        </div>
        <nav className="hud-rail" aria-label="Jump to season">
          <div className="hud-track">
            <div ref={bar} className="hud-bar" />
          </div>
          {[
            { t: 0.24, n: "I", label: "Spring" },
            { t: 0.46, n: "II", label: "Summer" },
            { t: 0.68, n: "III", label: "Autumn" },
            { t: 0.865, n: "IV", label: "Winter" },
          ].map((s, i) => (
            <button key={s.n} className="hud-tick" style={{ top: `${s.t * 100}%` }} onClick={() => jump(s.t)} data-active={act === i + 1} aria-label={`Go to ${s.label}`}>
              <span className="eyebrow">{s.n}</span>
            </button>
          ))}
          <span ref={pct} className="eyebrow hud-pct">00</span>
        </nav>
      </div>
    </>
  );
}
