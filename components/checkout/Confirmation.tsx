"use client";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { bySlug, formatPrice } from "@/lib/fragrances";
import { WorldDirector } from "../shell/WorldDirector";
import { TLink } from "../shell/TLink";
import { Footer } from "../shell/Footer";
import { Arrow, SeasonMark } from "../brand";
import type { PlacedOrder } from "./Checkout";

const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long" });

export function Confirmation() {
  const [order, setOrder] = useState<PlacedOrder | null | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("quatrea-order");
      setOrder(raw ? JSON.parse(raw) : null);
    } catch {
      setOrder(null);
    }
  }, []);

  useLayoutEffect(() => {
    if (!order || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".cf .line > span", { yPercent: 118 }, { yPercent: 0, duration: 1.6, stagger: 0.1, ease: "expo.out", delay: 0.9 });
      gsap.fromTo(".cf .fade, .cf-timeline, .cf-card", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1, ease: "expo.out", delay: 1.2 });
      gsap.fromTo(".cf-mark path", { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.25, delay: 1 });
    }, root);
    return () => ctx.revert();
  }, [order]);

  if (order === undefined) return <main className="page co" />;
  if (!order) {
    return (
      <main className="page co">
        <WorldDirector mode="hidden" tone="dark" />
        <div className="co-empty container-x">
          <SeasonMark size={44} />
          <h1 className="display" style={{ fontSize: "min(6vw,10vh)", margin: 0 }}>
            No recent <em>order.</em>
          </h1>
          <TLink href="/collection" className="btn btn-solid">
            Explore the collection <Arrow />
          </TLink>
        </div>
      </main>
    );
  }

  const placed = new Date(order.placedAt);
  const express = order.shipping.startsWith("Express");
  const from = new Date(placed.getTime() + (express ? 1 : 3) * 864e5);
  const to = new Date(placed.getTime() + (express ? 2 : 5) * 864e5);

  return (
    <main className="page co" ref={root}>
      <WorldDirector mode="hidden" tone="dark" />
      <section className="cf container-x">
        <svg viewBox="0 0 24 24" width="54" height="54" className="cf-mark" aria-hidden>
          {["M12 12 L12 2 A10 10 0 0 0 2 12 Z", "M12 12 L22 12 A10 10 0 0 0 12 2 Z", "M12 12 L12 22 A10 10 0 0 0 22 12 Z", "M12 12 L2 12 A10 10 0 0 0 12 22 Z"].map((d) => (
            <path key={d} d={d} fill="currentColor" />
          ))}
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <path d="M2.4 12 H21.6 M12 2.4 V21.6" stroke="#f5f0e8" strokeWidth="0.9" />
        </svg>
        <span className="eyebrow fade">Order {order.number} · Confirmed</span>
        <h1 className="display">
          <span className="line">
            <span>Merci, {order.firstName}.</span>
          </span>
          <span className="line">
            <span>
              <em>Your year has begun.</em>
            </span>
          </span>
        </h1>
        <p className="body-copy fade" style={{ textAlign: "center", maxWidth: "46ch" }}>
          A confirmation has been sent to {order.email}. Your flacons are being wrapped by hand in Grasse, with four discovery vials tucked inside.
        </p>
      </section>

      <div className="cf-timeline container-x">
        <div data-on="true">
          <span className="serif">Order placed</span>
          <span>{fmtDate(placed)}</span>
        </div>
        <div data-on="true">
          <span className="serif">Wrapped by hand</span>
          <span>Within two working days</span>
        </div>
        <div>
          <span className="serif">Dispatched</span>
          <span>{order.shipping}</span>
        </div>
        <div>
          <span className="serif">Delivered</span>
          <span>
            {fmtDate(from)} – {fmtDate(to)}
          </span>
        </div>
      </div>

      <div className="cf-card container-x" style={{ padding: 0 }}>
        <div>
          <span className="eyebrow">Your selection</span>
          <ul className="co-items">
            {order.items.map((it) => {
              const f = bySlug(it.slug)!;
              return (
                <li key={it.slug + it.size} className="co-item">
                  <span className="co-item-img" style={{ background: f.palette.soft }}>
                    <Image src={f.bottle} alt="" fill sizes="64px" />
                    <b>{it.qty}</b>
                  </span>
                  <span>
                    <span className="serif" style={{ fontSize: "1.35rem", display: "block" }}>{f.name}</span>
                    <span className="eyebrow" style={{ opacity: 0.55 }}>{f.seasonLabel} · {it.size}</span>
                  </span>
                  <span>{formatPrice(it.price * it.qty)}</span>
                </li>
              );
            })}
          </ul>
          <div className="co-line">
            <span>Delivery</span>
            <span>{order.shippingCost ? formatPrice(order.shippingCost) : "Complimentary"}</span>
          </div>
          <div className="co-total">
            <span className="eyebrow">Total paid</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
        <div>
          <span className="eyebrow">Delivering to</span>
          <p className="serif" style={{ fontSize: "1.3rem", margin: 0, lineHeight: 1.4 }}>{order.address}</p>
          <span className="eyebrow" style={{ marginTop: "1.2rem" }}>While you wait</span>
          <p className="body-copy" style={{ margin: 0 }}>Discover the philosophy behind the four quarters, or find the season you have not yet met.</p>
          <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap", marginTop: ".6rem" }}>
            <TLink href="/maison" className="btn">La Maison</TLink>
            <TLink href="/discover" className="btn btn-solid">
              Find your season <Arrow />
            </TLink>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
