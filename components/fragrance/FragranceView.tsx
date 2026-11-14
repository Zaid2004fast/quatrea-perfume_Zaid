"use client";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FRAGRANCES, formatPrice, type Fragrance, type Note } from "@/lib/fragrances";
import { setWorldUi } from "@/lib/world-store";
import { flyTo } from "@/lib/world-control";
import { TLink } from "../shell/TLink";
import { useBag } from "../shell/Providers";
import { Footer } from "../shell/Footer";
import { Arrow, SeasonMark } from "../brand";

const L = ({ children }: { children: React.ReactNode }) => (
  <span className="line">
    <span>{children}</span>
  </span>
);

const PHASE = {
  top: { label: "Top", time: "0 – 30 min", copy: "The first impression, bright and fleeting." },
  heart: { label: "Heart", time: "30 min – 4 h", copy: "The character of the fragrance, unfolding on skin." },
  base: { label: "Base", time: "4 h and beyond", copy: "What remains: the memory of the day." },
};

function NoteCard({ n, accent }: { n: Note; accent: string }) {
  return (
    <div className="note-card" data-reveal>
      <div className={`note-media ${n.image?.includes("/photo/") ? "is-photo" : ""}`} style={{ background: accent }}>
        {n.image?.includes("/photo/") ? (
          <Image src={n.image} alt={n.name} fill sizes="(max-width: 820px) 100vw, 30vw" />
        ) : n.image ? (
          <Image src={n.image} alt={n.name} width={260} height={260} />
        ) : (
          <span className="note-type">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <path d="M2 12 H22 M12 2 V22" stroke="currentColor" strokeWidth="0.6" />
            </svg>
            <span className="display">{n.name}</span>
            <span className="eyebrow">Accord</span>
          </span>
        )}
      </div>
      <h4 className="serif note-name">{n.name}</h4>
      <p className="note-desc">{n.description}</p>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="meter">
      <span className="eyebrow">{label}</span>
      <span className="meter-dots">
        {[1, 2, 3, 4, 5].map((d) => (
          <span key={d} data-on={d <= value} />
        ))}
      </span>
    </div>
  );
}

export function FragranceView({ f }: { f: Fragrance }) {
  const bag = useBag();
  const [size, setSize] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const hero = useRef<HTMLDivElement>(null);
  const others = FRAGRANCES.filter((x) => x.slug !== f.slug);
  const tone = f.season === "autumn" || f.season === "winter" ? "light" : "dark";

  useEffect(() => {
    setWorldUi({ visible: true });
    const mobile = window.matchMedia("(max-width: 820px)").matches;
    flyTo(f.worldT, { frame: mobile ? 0 : 0.4 });
    document.documentElement.dataset.tone = tone;
    const onScroll = () => {
      document.documentElement.dataset.tone = window.scrollY > window.innerHeight * 0.75 ? "dark" : tone;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.dataset.tone = "dark";
    };
  }, [f.worldT, tone]);

  useLayoutEffect(() => {
    const el = hero.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll(".line > span"), { yPercent: 118 }, { yPercent: 0, duration: 1.6, stagger: 0.1, ease: "expo.out", delay: 1.2 });
      gsap.fromTo(el.querySelectorAll(".fade"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08, ease: "expo.out", delay: 1.5 });
    }, el);
    return () => ctx.revert();
  }, []);

  const price = f.prices[size];
  return (
    <main className="page fragrance" style={{ ["--accent" as string]: f.palette.accent, ["--soft" as string]: f.palette.soft, ["--bgc" as string]: f.palette.bg }}>
      {/* HERO — the flacon in its world */}
      <section className="fr-hero container-x" ref={hero}>
        <div className="fr-hero-inner">
          <div className="eyebrow fade" style={{ display: "flex", gap: ".8rem", alignItems: "center" }}>
            <SeasonMark active={f.index} size={14} /> {f.numeral} — {f.frenchSeason} · Eau de parfum
          </div>
          <h1 className="display fr-name">
            <L>{f.name}</L>
          </h1>
          <p className="display italic fr-tag">
            <L>{f.tagline}</L>
          </p>
          <div className="fade fr-hero-cta">
            <a href="#acquire" className="btn btn-solid">
              Acquire · {formatPrice(f.prices[0].price)}
            </a>
            <span className="eyebrow" style={{ opacity: 0.75 }}>{f.hour}</span>
          </div>
        </div>
        <div className="fade fr-scroll eyebrow">Scroll · The story</div>
      </section>

      {/* STORY */}
      <section className="fr-solid">
        <div className="fr-story container-x">
          <div className="fr-story-media" data-reveal>
            <Image src={f.bottle} alt={`${f.name} flacon`} fill sizes="(max-width: 820px) 100vw, 45vw" priority={false} />
          </div>
          <div className="fr-story-text">
            <span className="eyebrow" data-reveal>The story · {f.stateOfBeing}</span>
            <h2 className="display fr-h2" data-reveal-lines>
              <L>{f.theme.split(",")[0]},</L>
              <L>
                <em>{f.theme.split(",").slice(1).join(",").trim().replace(/\.$/, "")}.</em>
              </L>
            </h2>
            {f.story.map((p, k) => (
              <p key={k} className={`fr-p ${k === 0 ? "dropcap" : ""}`} data-reveal>
                {p}
              </p>
            ))}
            <div className="fr-moods" data-reveal>
              {f.mood.map((m) => (
                <span key={m} className="fr-mood serif italic">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div className="fr-notes container-x">
          <header className="fr-notes-head">
            <span className="eyebrow" data-reveal>The composition</span>
            <h2 className="display fr-h2" data-reveal-lines>
              <L>How it moves</L>
              <L>
                <em>across the day.</em>
              </L>
            </h2>
          </header>
          {(["top", "heart", "base"] as const).map((k) => (
            <div key={k} className="fr-tier">
              <div className="fr-tier-label" data-reveal>
                <span className="display">{PHASE[k].label}</span>
                <span className="eyebrow">{PHASE[k].time}</span>
                <p>{PHASE[k].copy}</p>
              </div>
              <div className="fr-tier-notes">
                {f.notes[k].map((n) => (
                  <NoteCard key={n.name} n={n} accent={f.palette.soft} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ACQUIRE */}
        <div id="acquire" className="fr-buy container-x">
          <div className="fr-buy-media" data-reveal>
            <Image src={f.bottle} alt="" fill sizes="(max-width: 820px) 100vw, 40vw" />
          </div>
          <div className="fr-buy-panel">
            <span className="eyebrow" data-reveal>Eau de parfum · 20% concentration</span>
            <h2 className="display fr-buy-name" data-reveal>{f.name}</h2>
            <p className="body-copy" data-reveal>{f.theme}</p>
            <div className="fr-sizes" role="radiogroup" aria-label="Size" data-reveal>
              {f.prices.map((p, k) => (
                <button key={p.size} role="radio" aria-checked={k === size} data-on={k === size} onClick={() => { setSize(k); setAdded(false); }}>
                  <span className="serif">{p.size}</span>
                  <span className="eyebrow">{formatPrice(p.price)}</span>
                </button>
              ))}
            </div>
            <div className="fr-buy-row" data-reveal>
              <div className="qty" style={{ color: "inherit" }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(9, q + 1))} aria-label="Increase quantity">+</button>
              </div>
              <button
                className="btn btn-solid fr-add"
                onClick={() => {
                  bag.add({ slug: f.slug, size: price.size, price: price.price }, qty);
                  setAdded(true);
                  bag.setOpen(true);
                }}
              >
                {added ? "Added to your bag" : `Add to bag · ${formatPrice(price.price * qty)}`}
              </button>
            </div>
            <div className="fr-meters" data-reveal>
              <Meter label="Longevity" value={f.longevity} />
              <Meter label="Sillage" value={f.sillage} />
            </div>
            <ul className="fr-facts" data-reveal>
              <li><span className="eyebrow">Composed</span><span>In Grasse, in four movements</span></li>
              <li><span className="eyebrow">Flacon</span><span>Hand-finished glass, refillable</span></li>
              <li><span className="eyebrow">Wear it</span><span>{f.hour}</span></li>
              <li><span className="eyebrow">With every order</span><span>Four-season discovery vials</span></li>
            </ul>
          </div>
        </div>

        {/* RELATED */}
        <div className="fr-related container-x">
          <span className="eyebrow" data-reveal>Continue the year</span>
          <div className="fr-related-row">
            {others.map((o) => (
              <TLink key={o.slug} href={`/fragrance/${o.slug}`} className="card" style={{ ["--card" as string]: o.palette.soft }} data-reveal>
                <div className="card-media">
                  <Image src={o.bottle} alt={o.name} fill sizes="(max-width: 820px) 80vw, 30vw" />
                </div>
                <div className="card-meta">
                  <span className="eyebrow"><SeasonMark active={o.index} size={12} /> {o.numeral} · {o.seasonLabel}</span>
                  <span className="eyebrow">{formatPrice(o.prices[0].price)}</span>
                </div>
                <h3 className="display card-name">{o.name}</h3>
                <p className="serif italic card-tag">{o.tagline}</p>
              </TLink>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }} data-reveal>
            <TLink href="/collection" className="btn">
              The full collection <Arrow />
            </TLink>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
