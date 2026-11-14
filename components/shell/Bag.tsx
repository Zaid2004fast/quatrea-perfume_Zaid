"use client";
import Image from "next/image";
import { useEffect } from "react";
import { bySlug, formatPrice } from "@/lib/fragrances";
import { useBag } from "./Providers";
import { TLink } from "./TLink";
import { SeasonMark } from "../brand";

export function BagDrawer() {
  const bag = useBag();
  useEffect(() => {
    if (!bag.open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && bag.setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bag.open, bag]);

  return (
    <div className="bag" data-open={bag.open} aria-hidden={!bag.open}>
      <button className="bag-scrim" aria-label="Close bag" onClick={() => bag.setOpen(false)} tabIndex={bag.open ? 0 : -1} />
      <aside className="bag-panel" role="dialog" aria-label="Your bag">
        <div className="bag-head">
          <span className="eyebrow">Your bag · {bag.count}</span>
          <button className="eyebrow link-u" onClick={() => bag.setOpen(false)} tabIndex={bag.open ? 0 : -1}>
            Close
          </button>
        </div>
        {bag.items.length === 0 ? (
          <div className="bag-empty">
            <SeasonMark size={46} />
            <p className="display italic" style={{ fontSize: "2.4rem", margin: "1.5rem 0 1rem" }}>
              Your bag is empty.
            </p>
            <p className="body-copy" style={{ color: "rgba(21,18,15,.65)", margin: "0 auto 2rem" }}>
              Four seasons are waiting. Begin with the one you are living now.
            </p>
            <TLink href="/collection" className="btn" onClick={() => bag.setOpen(false)} tabIndex={bag.open ? 0 : -1}>
              Explore the collection
            </TLink>
          </div>
        ) : (
          <>
            <ul className="bag-list">
              {bag.items.map((it) => {
                const f = bySlug(it.slug)!;
                return (
                  <li key={it.slug + it.size} className="bag-item">
                    <div className="bag-thumb" style={{ background: f.palette.soft }}>
                      <Image src={f.bottle} alt="" width={96} height={120} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="eyebrow" style={{ opacity: 0.55 }}>{f.seasonLabel} · {it.size}</div>
                      <div className="display" style={{ fontSize: "1.9rem", margin: ".3rem 0 .8rem" }}>{f.name}</div>
                      <div className="qty">
                        <button onClick={() => bag.update(it.slug, it.size, it.qty - 1)} aria-label="Decrease quantity" tabIndex={bag.open ? 0 : -1}>−</button>
                        <span>{it.qty}</span>
                        <button onClick={() => bag.update(it.slug, it.size, it.qty + 1)} aria-label="Increase quantity" tabIndex={bag.open ? 0 : -1}>+</button>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontVariantNumeric: "tabular-nums" }}>{formatPrice(it.price * it.qty)}</div>
                      <button className="eyebrow link-u" style={{ marginTop: "1rem", opacity: 0.6, fontSize: ".58rem" }} onClick={() => bag.update(it.slug, it.size, 0)} tabIndex={bag.open ? 0 : -1}>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="bag-foot">
              <div className="bag-row"><span className="eyebrow">Complimentary</span><span>Four-season discovery vials</span></div>
              <div className="bag-row"><span className="eyebrow">Subtotal</span><span className="display" style={{ fontSize: "2rem" }}>{formatPrice(bag.total)}</span></div>
              <TLink
                href="/checkout"
                className="btn btn-solid"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => bag.setOpen(false)}
                tabIndex={bag.open ? 0 : -1}
              >
                Proceed to checkout
              </TLink>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
