"use client";
import Image from "next/image";
import { FRAGRANCES, formatPrice } from "@/lib/fragrances";
import { TLink } from "../shell/TLink";
import { Arrow, SeasonMark } from "../brand";

const L = ({ children }: { children: React.ReactNode }) => (
  <span className="line">
    <span>{children}</span>
  </span>
);

/** Where the film ends and the house begins: the collection laid out like a gallery wall. */
export function Epilogue() {
  return (
    <section className="epilogue">
      <div className="epilogue-fade" aria-hidden />
      <div className="epilogue-body container-x">
        <header className="epilogue-head">
          <div className="eyebrow" data-reveal>The collection · Quatre saisons</div>
          <h2 className="display epilogue-title" data-reveal-lines>
            <L>Four flacons.</L>
            <L>
              <em>One turning year.</em>
            </L>
          </h2>
          <p className="body-copy" data-reveal>
            One heavy, hand-finished flacon dressed four ways — rose gold, gilded glass, brass and leather, midnight lacquer — each composed to be worn in its season, or whenever you need it.
          </p>
        </header>

        <div className="card-row">
          {FRAGRANCES.map((f, i) => (
            <TLink key={f.slug} href={`/fragrance/${f.slug}`} className="card" style={{ ["--card" as string]: f.palette.soft, transitionDelay: `${i * 90}ms` }} data-reveal>
              <div className="card-media">
                <Image src={f.bottle} alt={`${f.name} eau de parfum`} fill sizes="(max-width: 820px) 80vw, 25vw" />
              </div>
              <div className="card-meta">
                <span className="eyebrow">
                  <SeasonMark active={f.index} size={12} /> {f.numeral} · {f.seasonLabel}
                </span>
                <span className="eyebrow">{formatPrice(f.prices[0].price)}</span>
              </div>
              <h3 className="display card-name">{f.name}</h3>
              <p className="serif italic card-tag">{f.tagline}</p>
            </TLink>
          ))}
        </div>

        <div className="duo">
          <TLink href="/maison" className="duo-item" data-reveal>
            <span className="eyebrow">La Maison</span>
            <span className="display duo-title">
              A house that keeps <em>time</em> by the seasons.
            </span>
            <span className="duo-link eyebrow">
              Read our philosophy <Arrow className="arrow" />
            </span>
          </TLink>
          <TLink href="/discover" className="duo-item duo-dark" data-reveal>
            <span className="eyebrow">Discover</span>
            <span className="display duo-title">
              Five questions. <em>One season</em> that is yours.
            </span>
            <span className="duo-link eyebrow">
              Find your season <Arrow className="arrow" />
            </span>
          </TLink>
        </div>
      </div>
    </section>
  );
}
