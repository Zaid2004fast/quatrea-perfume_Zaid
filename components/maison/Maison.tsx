"use client";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FRAGRANCES } from "@/lib/fragrances";
import { WorldDirector } from "../shell/WorldDirector";
import { TLink } from "../shell/TLink";
import { Footer } from "../shell/Footer";
import { Arrow, SeasonMark } from "../brand";

const L = ({ children }: { children: React.ReactNode }) => (
  <span className="line">
    <span>{children}</span>
  </span>
);

const MANIFESTO =
  "We believe a fragrance should keep time the way a garden does — not in hours, but in seasons. The green breath of a morning after rain. The salt of a long afternoon. The copper hush of evening. The silence of first snow.";

const CRAFT = [
  { n: "I", t: "Gathered at the turn", c: "Every material is sourced in the season it belongs to — blossom in spring, citrus in high summer, resin as the year cools.", img: "/img/notes/photo/pear-blossom.webp" },
  { n: "II", t: "Rested for a season", c: "Each composition macerates for ninety days — one full quarter of the year — before it meets the glass.", img: "/img/notes/photo/amber.webp" },
  { n: "III", t: "Composed in quarters", c: "Four perfumers, one for each season, work in conversation. Nothing is finished until it can stand beside the other three.", img: "/img/notes/photo/saffron.webp" },
  { n: "IV", t: "Finished by hand", c: "Flacons are polished, filled and dressed by hand in small batches — and every one is refillable, because a year comes back around.", img: "/img/notes/photo/white-musk.webp" },
];

export function Maison() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll(".ms-hero .line > span"), { yPercent: 118 }, { yPercent: 0, duration: 1.7, stagger: 0.12, ease: "expo.out", delay: 0.9 });
      gsap.fromTo(el.querySelectorAll(".ms-hero .fade"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.3, stagger: 0.1, ease: "expo.out", delay: 1.3 });
      gsap.fromTo(el.querySelectorAll(".ms-gallery figure"), { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 1.6, stagger: 0.12, ease: "expo.out", delay: 1.1 });
      // the gallery drifts at different speeds as you leave the hero
      el.querySelectorAll<HTMLElement>(".ms-gallery figure").forEach((f, i) => {
        gsap.to(f, { yPercent: [-14, -26, -8, -20][i], ease: "none", scrollTrigger: { trigger: ".ms-gallery", start: "top 80%", end: "bottom top", scrub: true } });
      });
      gsap.fromTo(
        el.querySelectorAll(".ms-manifesto .w"),
        { opacity: 0.15 },
        { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: ".ms-manifesto", start: "top 75%", end: "bottom 50%", scrub: true } },
      );
      el.querySelectorAll<HTMLElement>(".ms-season-media").forEach((m) => {
        gsap.fromTo(m.querySelector("img"), { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } });
      });
    }, el);
    const r = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(r);
      ctx.revert();
    };
  }, []);

  return (
    <main className="page ms" ref={root}>
      <WorldDirector mode="hidden" tone="dark" />

      {/* OPENING */}
      <section className="ms-hero container-x">
        <div className="eyebrow fade">La Maison · Est. at the spring equinox</div>
        <h1 className="display ms-title">
          <L>Four seasons.</L>
          <L>
            <em>Four states of being.</em>
          </L>
        </h1>
        <p className="body-copy fade ms-lede">
          Quatréa composes the year in four movements — a house devoted to the idea that time itself is the most beautiful composition there is.
        </p>
      </section>
      <div className="ms-gallery container-x">
        {FRAGRANCES.map((f) => (
          <figure key={f.slug}>
            <div className="ms-gallery-img" style={{ background: f.palette.soft }}>
              <Image src={f.bottle} alt={`${f.name} flacon`} fill sizes="(max-width: 820px) 45vw, 22vw" priority />
            </div>
            <figcaption>
              <span className="eyebrow">{f.numeral} · {f.frenchSeason}</span>
              <span className="serif italic">{f.name}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* MANIFESTO */}
      <section className="ms-manifesto container-x">
        <SeasonMark size={34} stroke={0.7} />
        <p className="display">
          {MANIFESTO.split(" ").map((w, i) => (
            <span key={i} className="w">
              {w}{" "}
            </span>
          ))}
        </p>
        <span className="eyebrow">The Quatréa manifesto</span>
      </section>

      {/* FOUR STATES — alternating, balanced compositions */}
      <section className="ms-seasons container-x">
        <header className="ms-section-head">
          <span className="eyebrow" data-reveal>The four quarters</span>
          <h2 className="display ms-h2" data-reveal-lines>
            <L>A year, in</L>
            <L>
              <em>four movements.</em>
            </L>
          </h2>
        </header>
        {FRAGRANCES.map((f, i) => {
          const notes = [...f.notes.top, ...f.notes.heart, ...f.notes.base].filter((n) => n.image).slice(0, 3);
          return (
            <article key={f.slug} className={`ms-season ${i % 2 ? "is-flip" : ""}`} style={{ ["--tint" as string]: f.palette.soft }}>
              <div className="ms-season-media" data-reveal>
                <Image src={f.bottle} alt={`${f.name} flacon on stone`} fill sizes="(max-width: 820px) 100vw, 44vw" />
              </div>
              <div className="ms-season-text">
                <span className="eyebrow" data-reveal>
                  <SeasonMark active={i} size={14} /> {f.numeral} · {f.frenchSeason} · {f.seasonLabel}
                </span>
                <h3 className="display ms-state" data-reveal-lines>
                  <L>{f.stateOfBeing}</L>
                </h3>
                <p className="body-copy" data-reveal>{f.story[0]}</p>
                <div className="ms-notes" data-reveal>
                  {notes.map((n) => (
                    <span key={n.name} className="ms-note">
                      <span className="ms-note-img">
                        <Image src={n.image!} alt="" fill sizes="64px" />
                      </span>
                      <span className="serif">{n.name}</span>
                    </span>
                  ))}
                </div>
                <TLink href={`/fragrance/${f.slug}`} className="btn" data-reveal>
                  Discover {f.name} <Arrow />
                </TLink>
              </div>
            </article>
          );
        })}
      </section>

      {/* BAND */}
      <div className="ms-band" aria-hidden>
        <div className="ms-band-track">
          {[0, 1].map((k) => (
            <span key={k} className="display italic">
              Awakening <SeasonMark active={0} size={22} /> Radiance <SeasonMark active={1} size={22} /> Release <SeasonMark active={2} size={22} /> Stillness <SeasonMark active={3} size={22} />{" "}
            </span>
          ))}
        </div>
      </div>

      {/* CRAFT */}
      <section className="ms-craft container-x">
        <header className="ms-section-head">
          <span className="eyebrow" data-reveal>The craft</span>
          <h2 className="display ms-h2" data-reveal-lines>
            <L>Made slowly,</L>
            <L>
              <em>one quarter at a time.</em>
            </L>
          </h2>
        </header>
        <ol className="ms-craft-list">
          {CRAFT.map((c) => (
            <li key={c.n} data-reveal>
              <span className="ms-craft-img">
                <Image src={c.img} alt="" fill sizes="(max-width: 820px) 45vw, 22vw" />
              </span>
              <span className="display italic ms-craft-n">{c.n}</span>
              <h3 className="serif ms-craft-t">{c.t}</h3>
              <p>{c.c}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* QUOTE */}
      <section className="ms-quote container-x">
        <SeasonMark fillAll size={26} />
        <blockquote className="display" data-reveal>
          “I wanted a house where nothing is ever out of season — because every season is a way of being alive.”
        </blockquote>
        <cite className="eyebrow" data-reveal>Hélène Varenne · Founder &amp; Nose</cite>
        <div className="ms-cta" data-reveal>
          <TLink href="/collection" className="btn btn-solid">
            Explore the collection <Arrow />
          </TLink>
          <TLink href="/discover" className="btn">
            Find your season
          </TLink>
        </div>
      </section>
      <Footer />
    </main>
  );
}
