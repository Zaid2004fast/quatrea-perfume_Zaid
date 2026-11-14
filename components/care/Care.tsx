"use client";
import { useEffect, useState, type FormEvent } from "react";
import credits from "@/lib/credits.json";
import { WorldDirector } from "../shell/WorldDirector";
import { useLenis } from "../shell/Providers";
import { Footer } from "../shell/Footer";

const SECTIONS = [
  ["shipping", "Shipping"],
  ["returns", "Returns & refills"],
  ["faq", "Questions"],
  ["contact", "Contact"],
  ["privacy", "Privacy"],
  ["terms", "Terms of sale"],
  ["credits", "Image credits"],
] as const;

const FAQ = [
  ["How long does a fragrance last on skin?", "Each composition is an eau de parfum at 20% concentration. Expect six to ten hours, longer on clothing. Givre and Velours, with their resinous bases, are the most enduring."],
  ["Can I wear a season out of season?", "Of course. The seasons describe a mood, not a rule — many of our clients wear Givre in July, or Aubade on the first grey morning of November."],
  ["Do you offer samples?", "Every order includes four discovery vials, one of each season, so you can live with the whole year before choosing your next flacon."],
  ["Are your flacons refillable?", "Yes. Each flacon unscrews at the collar. Return it to us for a refill at a reduced price — the glass is made to last for many years."],
];

export function Care() {
  const lenis = useLenis();
  const [form, setForm] = useState({ name: "", email: "", topic: "Order", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: -90, duration: 1.4 });
      else el.scrollIntoView({ behavior: "smooth" });
    }, 900);
    return () => clearTimeout(t);
  }, [lenis]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = "Please enter a valid email address.";
    if (form.message.trim().length < 10) er.message = "A few more words, please.";
    setErrors(er);
    if (!Object.keys(er).length) setSent(true);
  };

  return (
    <main className="page care">
      <WorldDirector mode="hidden" tone="dark" />
      <section className="care-hero container-x">
        <span className="eyebrow">Client care</span>
        <h1 className="display">
          At your <em>service.</em>
        </h1>
        <nav className="care-nav">
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="eyebrow link-u"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(id);
                if (el) { if (lenis) lenis.scrollTo(el, { offset: -90 }); else el.scrollIntoView({ behavior: "smooth" }); }
                history.replaceState(null, "", `#${id}`);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </section>

      <div className="care-body container-x">
        <section id="shipping" className="care-sec">
          <h2>Shipping</h2>
          <div>
            <p>Every order is wrapped by hand and dispatched within two working days from our atelier in Grasse.</p>
            <ul>
              <li>Standard delivery, 3–5 working days — complimentary on orders over €150, otherwise €12.</li>
              <li>Express delivery, 1–2 working days — €25.</li>
              <li>We deliver across the European Union, the United Kingdom, Switzerland and Norway.</li>
            </ul>
          </div>
        </section>
        <section id="returns" className="care-sec">
          <h2>Returns &amp; refills</h2>
          <div>
            <p>Unopened flacons may be returned within 30 days for a full refund. If a fragrance is not quite your season, try the discovery vial first — every order includes all four.</p>
            <p>Refills are offered for every flacon at 25% less than a new bottle. Send your empty flacon back with the prepaid label included in your box.</p>
          </div>
        </section>
        <section id="faq" className="care-sec">
          <h2>Questions</h2>
          <div>
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section id="contact" className="care-sec">
          <h2>Contact</h2>
          <div>
            {sent ? (
              <p className="serif italic" style={{ fontSize: "1.5rem", color: "#15120f" }}>
                Thank you, {form.name.split(" ")[0]}. A member of our client care team will reply within one working day.
              </p>
            ) : (
              <form className="care-form" onSubmit={submit} noValidate>
                <div className="field" data-error={!!errors.name}>
                  <label htmlFor="c-name">Name</label>
                  <input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  {errors.name && <span className="field-err">{errors.name}</span>}
                </div>
                <div className="field" data-error={!!errors.email}>
                  <label htmlFor="c-email">Email</label>
                  <input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  {errors.email && <span className="field-err">{errors.email}</span>}
                </div>
                <div className="field full">
                  <label htmlFor="c-topic">Subject</label>
                  <select id="c-topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                    <option>Order</option>
                    <option>Fragrance consultation</option>
                    <option>Refills</option>
                    <option>Press</option>
                  </select>
                </div>
                <div className="field full" data-error={!!errors.message}>
                  <label htmlFor="c-msg">Message</label>
                  <textarea id="c-msg" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  {errors.message && <span className="field-err">{errors.message}</span>}
                </div>
                <div className="full">
                  <button className="btn btn-solid" type="submit">Send message</button>
                </div>
              </form>
            )}
          </div>
        </section>
        <section id="privacy" className="care-sec">
          <h2>Privacy</h2>
          <div>
            <p>We collect only what we need to fulfil your order and, if you choose, to send our seasonal letter. We never sell your information. Your bag is kept on your own device and nothing you type at checkout is stored on our servers.</p>
          </div>
        </section>
        <section id="terms" className="care-sec">
          <h2>Terms of sale</h2>
          <div>
            <p>Prices are shown in euros and include VAT. An order is confirmed once you receive your order number. Delivery times are estimates; we will tell you promptly if anything changes.</p>
          </div>
        </section>
        <section id="credits" className="care-sec">
          <h2>Image credits</h2>
          <div>
            <p>Raw-material photographs used on fragrance pages, under open licences:</p>
            <ul className="credits">
              {credits.map((c) => (
                <li key={c.note}>
                  <strong style={{ textTransform: "capitalize", color: "#15120f", fontWeight: 500 }}>{c.note.replace("-", " ")}</strong> — {c.title}
                  {c.creator ? ` by ${c.creator.split(",")[0]}` : ""} · {c.license} ·{" "}
                  <a className="link-u" href={c.source ?? "#"} target="_blank" rel="noreferrer">
                    source
                  </a>
                </li>
              ))}
              <li>Stone, fruit and shell models: Poly Haven, CC0.</li>
              <li>Water normal map: three.js examples, MIT licence.</li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
