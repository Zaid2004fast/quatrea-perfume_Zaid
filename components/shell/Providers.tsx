"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { FRAGRANCES } from "@/lib/fragrances";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Smooth scroll                                                       */
const LenisCtx = createContext<{ lenis: Lenis | null }>({ lenis: null });
export const useLenis = () => useContext(LenisCtx).lenis;

/* ------------------------------------------------------------------ */
/* Bag                                                                 */
export interface BagItem {
  slug: string;
  size: string;
  price: number;
  qty: number;
}
interface BagApi {
  items: BagItem[];
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (item: Omit<BagItem, "qty">, qty?: number) => void;
  update: (slug: string, size: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
}
const BagCtx = createContext<BagApi | null>(null);
export const useBag = () => useContext(BagCtx)!;

/* ------------------------------------------------------------------ */
/* Page transitions                                                    */
const TransitionCtx = createContext<{ go: (href: string, label?: string) => void }>({ go: () => {} });
export const useTransition = () => useContext(TransitionCtx);

const ROUTE_LABELS: Record<string, string> = {
  "/": "The Experience",
  "/collection": "The Collection",
  "/maison": "La Maison",
  "/discover": "Discover",
  "/care": "Client Care",
  "/checkout": "Checkout",
};
function labelFor(href: string) {
  const path = href.split("#")[0];
  if (ROUTE_LABELS[path]) return ROUTE_LABELS[path];
  const slug = href.split("/").pop();
  return FRAGRANCES.find((f) => f.slug === slug)?.name ?? "Quatréa";
}

export function Providers({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const curtain = useRef<HTMLDivElement>(null);
  const curtainLabel = useRef<HTMLSpanElement>(null);
  const pending = useRef<null | (() => void)>(null);

  // Lenis drives native scroll; GSAP's ticker drives Lenis so ScrollTrigger and Lenis share one clock.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const l = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(500, 33);
    setLenis(l);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
    };
  }, []);

  // New route: reset scroll, refresh triggers, lift the curtain, arm reveals.
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    if (pending.current) {
      const done = pending.current;
      pending.current = null;
      done();
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    const t = setTimeout(() => document.querySelectorAll("[data-reveal],[data-reveal-lines]").forEach((el) => io.observe(el)), 60);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(t);
      io.disconnect();
    };
  }, [pathname, lenis]);

  const go = useCallback(
    (href: string, label?: string) => {
      const [path, hash] = href.split("#");
      if (path === pathname) {
        const el = hash ? document.getElementById(hash) : null;
        if (el) { if (lenis) lenis.scrollTo(el, { offset: -90 }); else el.scrollIntoView({ behavior: "smooth" }); }
        else lenis?.scrollTo(0);
        return;
      }
      const c = curtain.current;
      if (!c) return router.push(href);
      if (curtainLabel.current) curtainLabel.current.textContent = label ?? labelFor(href);
      lenis?.stop();
      gsap.killTweensOf(c);
      gsap
        .timeline()
        .set(c, { clipPath: "inset(100% 0% 0% 0%)" })
        .to(c, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "expo.inOut" })
        .fromTo(c.querySelector(".curtain-inner"), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" }, "-=0.35")
        .add(() => {
          pending.current = () => {
            lenis?.start();
            gsap
              .timeline({ delay: 0.25 })
              .to(c.querySelector(".curtain-inner"), { yPercent: -30, opacity: 0, duration: 0.5, ease: "expo.in" })
              .to(c, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.95, ease: "expo.inOut" }, "-=0.15");
          };
          router.push(href);
        });
    },
    [lenis, pathname, router],
  );

  /* bag state, persisted per visitor */
  const [items, setItems] = useState<BagItem[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("quatrea-bag");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("quatrea-bag", JSON.stringify(items));
    } catch {}
  }, [items]);
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);
  const bag = useMemo<BagApi>(
    () => ({
      items,
      open,
      setOpen,
      add: (item, qty = 1) =>
        setItems((cur) => {
          const i = cur.findIndex((c) => c.slug === item.slug && c.size === item.size);
          if (i >= 0) return cur.map((c, j) => (j === i ? { ...c, qty: Math.min(9, c.qty + qty) } : c));
          return [...cur, { ...item, qty }];
        }),
      update: (slug, size, qty) =>
        setItems((cur) => (qty <= 0 ? cur.filter((c) => !(c.slug === slug && c.size === size)) : cur.map((c) => (c.slug === slug && c.size === size ? { ...c, qty: Math.min(9, qty) } : c)))),
      clear: () => setItems([]),
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.price, 0),
    }),
    [items, open],
  );

  return (
    <LenisCtx.Provider value={{ lenis }}>
      <TransitionCtx.Provider value={{ go }}>
        <BagCtx.Provider value={bag}>
          {children}
          <div ref={curtain} className="curtain" aria-hidden>
            <div className="curtain-inner" style={{ textAlign: "center" }}>
              <div className="eyebrow" style={{ opacity: 0.6, marginBottom: "1rem" }}>Quatréa</div>
              <span ref={curtainLabel} className="display italic" style={{ fontSize: "clamp(2.6rem,6vw,5.5rem)" }} />
            </div>
          </div>
        </BagCtx.Provider>
      </TransitionCtx.Provider>
    </LenisCtx.Provider>
  );
}
