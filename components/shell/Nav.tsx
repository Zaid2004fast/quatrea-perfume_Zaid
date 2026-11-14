"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TLink } from "./TLink";
import { useBag, useLenis } from "./Providers";
import { Wordmark } from "../brand";

export const NAV = [
  { href: "/", label: "The Experience" },
  { href: "/collection", label: "Collection" },
  { href: "/maison", label: "Maison" },
  { href: "/discover", label: "Discover" },
];

export function Nav() {
  const pathname = usePathname();
  const bag = useBag();
  const lenis = useLenis();
  const [menu, setMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    setMenu(false);
    setSolid(false);
  }, [pathname]);
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 240 && y > last + 2 ? true : y < last - 2 ? false : (h) => h);
      // on the home film the world shows through; elsewhere, content scrolling under the nav gets a paper backdrop
      const onFilm = window.location.pathname === "/" && !document.body.classList.contains("journey-done");
      const onHero = /^\/(collection|discover)$/.test(window.location.pathname);
      setSolid(y > 60 && !onFilm && !onHero);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (menu) lenis?.stop();
    else lenis?.start();
  }, [menu, lenis]);

  return (
    <>
      <header className="nav" data-solid={solid && !menu} data-hidden={hidden && !menu} style={menu ? { color: "#f4efe7" } : undefined}>
        <nav className="nav-links" aria-label="Primary">
          {NAV.map((n) => (
            <TLink key={n.href} href={n.href} className="link-u" aria-current={pathname === n.href ? "page" : undefined}>
              {n.label}
            </TLink>
          ))}
        </nav>
        <TLink href="/" className="wordmark-wrap" style={{ justifySelf: "center" }} label="The Experience">
          <Wordmark />
        </TLink>
        <div className="nav-right">
          <TLink href="/discover" className="link-u hide-sm">
            Find your season
          </TLink>
          <button onClick={() => bag.setOpen(true)} className="link-u" aria-label={`Open bag, ${bag.count} items`}>
            Bag <span style={{ fontVariantNumeric: "tabular-nums" }}>({bag.count})</span>
          </button>
          <button className="burger" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Menu">
            <span style={{ display: "grid", gap: 6, width: 26 }}>
              <span style={{ height: 1, background: "currentColor", transform: menu ? "translateY(3.5px) rotate(45deg)" : "none", transition: "transform .6s var(--ease-out)" }} />
              <span style={{ height: 1, background: "currentColor", transform: menu ? "translateY(-3.5px) rotate(-45deg)" : "none", transition: "transform .6s var(--ease-out)" }} />
            </span>
          </button>
        </div>
      </header>
      <div className="menu" data-open={menu} aria-hidden={!menu}>
        <div className="eyebrow" style={{ opacity: 0.5, marginBottom: "2rem" }}>Four seasons. Four states of being.</div>
        {NAV.map((n, i) => (
          <TLink key={n.href} href={n.href} tabIndex={menu ? 0 : -1} style={{ transitionDelay: `${i * 60}ms` }}>
            <span className="eyebrow" style={{ fontSize: ".6rem", marginRight: "1rem", verticalAlign: "middle", opacity: 0.5 }}>0{i + 1}</span>
            {n.label}
          </TLink>
        ))}
      </div>
    </>
  );
}
