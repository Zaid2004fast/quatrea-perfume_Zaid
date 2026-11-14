"use client";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { bySlug, formatPrice } from "@/lib/fragrances";
import { WorldDirector } from "../shell/WorldDirector";
import { TLink } from "../shell/TLink";
import { useBag, useTransition } from "../shell/Providers";
import { Arrow, SeasonMark } from "../brand";

export interface PlacedOrder {
  number: string;
  firstName: string;
  email: string;
  address: string;
  shipping: string;
  items: { slug: string; size: string; qty: number; price: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  placedAt: number;
}

const COUNTRIES = ["France", "United Kingdom", "Germany", "Italy", "Spain", "Netherlands", "Belgium", "Switzerland", "Sweden", "Denmark", "Norway", "Austria", "Portugal", "Ireland"];

type Field = "email" | "first" | "last" | "address" | "city" | "postcode" | "country" | "cardName" | "card" | "expiry" | "cvc";

export function Checkout() {
  const bag = useBag();
  const { go } = useTransition();
  const [v, setV] = useState<Record<Field, string>>({ email: "", first: "", last: "", address: "", city: "", postcode: "", country: "France", cardName: "", card: "", expiry: "", cvc: "" });
  const [ship, setShip] = useState<"standard" | "express">("standard");
  const [pay, setPay] = useState<"card" | "paypal" | "applepay">("card");
  const [gift, setGift] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [placing, setPlacing] = useState(false);

  const shippingCost = ship === "express" ? 25 : bag.total >= 150 ? 0 : 12;
  const total = bag.total + shippingCost;

  const set = (k: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let val = e.target.value;
    if (k === "card") val = val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    if (k === "expiry") val = val.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
    if (k === "cvc") val = val.replace(/\D/g, "").slice(0, 4);
    setV((cur) => ({ ...cur, [k]: val }));
    setErrors((cur) => ({ ...cur, [k]: undefined }));
  };

  const validate = () => {
    const er: Partial<Record<Field, string>> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) er.email = "Enter a valid email address.";
    (["first", "last", "address", "city"] as Field[]).forEach((k) => !v[k].trim() && (er[k] = "Required."));
    if (!/^[A-Za-z0-9 -]{3,10}$/.test(v.postcode.trim())) er.postcode = "Enter a valid postcode.";
    if (pay === "card") {
      if (!v.cardName.trim()) er.cardName = "Required.";
      if (v.card.replace(/\s/g, "").length < 15) er.card = "Enter a valid card number.";
      const [mm, yy] = v.expiry.split("/").map(Number);
      if (!mm || mm > 12 || !yy || yy + 2000 < new Date().getFullYear()) er.expiry = "MM/YY";
      if (v.cvc.length < 3) er.cvc = "3–4 digits";
    }
    setErrors(er);
    return !Object.keys(er).length;
  };

  const place = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPlacing(true);
    const order: PlacedOrder = {
      number: "QA-" + Math.floor(100000 + Math.random() * 900000),
      firstName: v.first.trim(),
      email: v.email.trim(),
      address: `${v.address}, ${v.postcode} ${v.city}, ${v.country}`,
      shipping: ship === "express" ? "Express · 1–2 working days" : "Standard · 3–5 working days",
      items: bag.items.map((i) => ({ ...i })),
      subtotal: bag.total,
      shippingCost,
      total,
      placedAt: Date.now(),
    };
    try {
      sessionStorage.setItem("quatrea-order", JSON.stringify(order));
    } catch {}
    setTimeout(() => {
      bag.clear();
      go("/checkout/confirmation", "Merci");
    }, 900);
  };

  // a render helper (not a component) so inputs keep focus while typing
  const F = ({ k, label, type = "text", auto, placeholder }: { k: Field; label: string; type?: string; auto?: string; placeholder?: string }) => (
    <div className="field" data-error={!!errors[k]} key={k}>
      <label htmlFor={`co-${k}`}>{label}</label>
      <input id={`co-${k}`} type={type} autoComplete={auto} placeholder={placeholder} value={v[k]} onChange={set(k)} inputMode={k === "card" || k === "cvc" || k === "expiry" ? "numeric" : undefined} />
      {errors[k] && <span className="field-err">{errors[k]}</span>}
    </div>
  );

  if (!bag.items.length) {
    return (
      <main className="page co">
        <WorldDirector mode="hidden" tone="dark" />
        <div className="co-empty container-x">
          <SeasonMark size={44} />
          <h1 className="display" style={{ fontSize: "min(6vw,10vh)", margin: 0 }}>
            Your bag is <em>empty.</em>
          </h1>
          <p className="body-copy">Choose your season, then return here to complete your order.</p>
          <TLink href="/collection" className="btn btn-solid">
            Explore the collection <Arrow />
          </TLink>
        </div>
      </main>
    );
  }

  return (
    <main className="page co">
      <WorldDirector mode="hidden" tone="dark" />
      <header className="co-head container-x">
        <div>
          <span className="eyebrow">Secure checkout</span>
          <h1 className="display">
            Complete your <em>order.</em>
          </h1>
        </div>
        <div className="co-steps eyebrow">
          <span data-on="true">01 Bag</span>
          <span data-on="true">02 Details</span>
          <span>03 Confirmation</span>
        </div>
      </header>

      <form className="co-grid container-x" onSubmit={place} noValidate>
        <div className="co-form">
          <section className="co-block">
            <h2>
              <span className="eyebrow">01</span> Contact
            </h2>
            {F({ k: "email", label: "Email", type: "email", auto: "email" })}
          </section>

          <section className="co-block">
            <h2>
              <span className="eyebrow">02</span> Delivery address
            </h2>
            <div className="co-row">
              {F({ k: "first", label: "First name", auto: "given-name" })}
              {F({ k: "last", label: "Last name", auto: "family-name" })}
            </div>
            {F({ k: "address", label: "Address", auto: "street-address" })}
            <div className="co-row3">
              {F({ k: "city", label: "City", auto: "address-level2" })}
              {F({ k: "postcode", label: "Postcode", auto: "postal-code" })}
              <div className="field">
                <label htmlFor="co-country">Country</label>
                <select id="co-country" value={v.country} onChange={set("country")} autoComplete="country-name">
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="co-block">
            <h2>
              <span className="eyebrow">03</span> Delivery
            </h2>
            {(
              [
                ["standard", "Standard delivery", "3–5 working days", bag.total >= 150 ? "Complimentary" : formatPrice(12)],
                ["express", "Express delivery", "1–2 working days", formatPrice(25)],
              ] as const
            ).map(([id, t, s, p]) => (
              <label key={id} className="co-option" data-on={ship === id}>
                <input type="radio" name="ship" checked={ship === id} onChange={() => setShip(id)} />
                <span className="co-opt-main">
                  <span>{t}</span>
                  <span>{s}</span>
                </span>
                <span>{p}</span>
              </label>
            ))}
            <label className="co-option" data-on={gift}>
              <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} />
              <span className="co-opt-main">
                <span>Gift wrapping</span>
                <span>Our seasonal box with a handwritten card</span>
              </span>
              <span>Complimentary</span>
            </label>
          </section>

          <section className="co-block">
            <h2>
              <span className="eyebrow">04</span> Payment
            </h2>
            {(
              [
                ["card", "Credit or debit card", "Visa, Mastercard, American Express"],
                ["paypal", "PayPal", "You will confirm with PayPal"],
                ["applepay", "Apple Pay", "Confirm on your device"],
              ] as const
            ).map(([id, t, s]) => (
              <label key={id} className="co-option" data-on={pay === id}>
                <input type="radio" name="pay" checked={pay === id} onChange={() => setPay(id)} />
                <span className="co-opt-main">
                  <span>{t}</span>
                  <span>{s}</span>
                </span>
              </label>
            ))}
            {pay === "card" && (
              <>
                {F({ k: "cardName", label: "Name on card", auto: "cc-name" })}
                {F({ k: "card", label: "Card number", auto: "cc-number", placeholder: "1234 5678 9012 3456" })}
                <div className="co-row">
                  {F({ k: "expiry", label: "Expiry", auto: "cc-exp", placeholder: "MM/YY" })}
                  {F({ k: "cvc", label: "Security code", auto: "cc-csc", placeholder: "CVC" })}
                </div>
              </>
            )}
            <p className="co-secure">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Checkout preview — card details never leave your browser and no payment is taken.
            </p>
          </section>
        </div>

        <aside className="co-summary">
          <h2>Your order</h2>
          <ul className="co-items">
            {bag.items.map((it) => {
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
            <span>Subtotal</span>
            <span>{formatPrice(bag.total)}</span>
          </div>
          <div className="co-line">
            <span>Delivery</span>
            <span>{shippingCost ? formatPrice(shippingCost) : "Complimentary"}</span>
          </div>
          <div className="co-line">
            <span>Four-season discovery vials</span>
            <span>Included</span>
          </div>
          <div className="co-total">
            <span className="eyebrow">Total · VAT included</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button className="btn btn-solid co-place" type="submit" disabled={placing}>
            {placing ? "Placing your order…" : `Place order · ${formatPrice(total)}`}
          </button>
          <TLink href="/collection" className="eyebrow link-u" style={{ justifySelf: "center", opacity: 0.7 }}>
            Continue shopping
          </TLink>
        </aside>
      </form>
    </main>
  );
}
