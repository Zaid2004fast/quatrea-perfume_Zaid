"use client";
import { useState, type FormEvent } from "react";
import { FRAGRANCES } from "@/lib/fragrances";
import { TLink } from "./TLink";
import { Arrow, SeasonMark, Wordmark } from "../brand";

const SERVICES = [
  { t: "Complimentary delivery", c: "On every order over €150" },
  { t: "Four discovery vials", c: "Included with each flacon" },
  { t: "Refillable flacons", c: "Return, refill, renew each season" },
  { t: "Hand-finished in Grasse", c: "In small seasonal batches" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setState("error");
    setState("done");
    setEmail("");
  };
  return (
    <footer className="ft">
      <div className="ft-services container-x">
        {SERVICES.map((s, i) => (
          <div key={s.t} className="ft-service">
            <SeasonMark active={i} size={18} stroke={0.9} />
            <div>
              <div className="ft-service-t">{s.t}</div>
              <div className="ft-service-c">{s.c}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ft-main container-x">
        <div className="ft-brand">
          <TLink href="/" label="The Experience" aria-label="Quatréa home">
            <Wordmark style={{ fontSize: "1.5rem" }} />
          </TLink>
          <p className="ft-tag">Maison de parfum. Four seasons, four states of being.</p>
          <div className="ft-news">
            <span className="eyebrow">The seasonal letter</span>
            <p>Four letters a year — one at each equinox and solstice — with first access to new compositions.</p>
            {state === "done" ? (
              <p className="ft-thanks">Thank you. Your first letter arrives with the next turn of the season.</p>
            ) : (
              <form onSubmit={submit} className="ft-form" noValidate>
                <label htmlFor="ft-email" className="sr-only">Email address</label>
                <input
                  id="ft-email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setState("idle");
                  }}
                  aria-invalid={state === "error"}
                />
                <button type="submit">
                  Subscribe <Arrow className="arrow" />
                </button>
                {state === "error" && <span className="ft-error">Please enter a valid email address.</span>}
              </form>
            )}
          </div>
        </div>

        <nav className="ft-col" aria-label="Shop">
          <span className="eyebrow">Shop</span>
          <TLink href="/collection" className="link-u">The Collection</TLink>
          {FRAGRANCES.map((f) => (
            <TLink key={f.slug} href={`/fragrance/${f.slug}`} className="link-u">
              {f.name} <em>· {f.seasonLabel}</em>
            </TLink>
          ))}
        </nav>
        <nav className="ft-col" aria-label="The house">
          <span className="eyebrow">The House</span>
          <TLink href="/" className="link-u">The Experience</TLink>
          <TLink href="/maison" className="link-u">La Maison</TLink>
          <TLink href="/discover" className="link-u">Find your season</TLink>
          <TLink href="/care#contact" className="link-u">Book a consultation</TLink>
        </nav>
        <nav className="ft-col" aria-label="Client care">
          <span className="eyebrow">Client Care</span>
          <TLink href="/care#shipping" className="link-u">Shipping &amp; delivery</TLink>
          <TLink href="/care#returns" className="link-u">Returns &amp; refills</TLink>
          <TLink href="/care#faq" className="link-u">Questions</TLink>
          <TLink href="/care#contact" className="link-u">Contact us</TLink>
        </nav>
      </div>

      <div className="ft-base container-x">
        <span>© {new Date().getFullYear()} Quatréa Parfums. All rights reserved.</span>
        <nav className="ft-legal" aria-label="Legal">
          <TLink href="/care#privacy" className="link-u">Privacy</TLink>
          <TLink href="/care#terms" className="link-u">Terms of sale</TLink>
          <TLink href="/care#credits" className="link-u">Image credits</TLink>
        </nav>
        <span className="ft-locale">EUR € · English</span>
      </div>
    </footer>
  );
}
