"use client";
import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { FRAGRANCES, formatPrice } from "@/lib/fragrances";
import { setWorldUi } from "@/lib/world-store";
import { flyTo } from "@/lib/world-control";
import { TLink } from "../shell/TLink";
import { useBag } from "../shell/Providers";
import { Arrow, SeasonMark } from "../brand";

type W = [number, number, number, number]; // spring, summer, autumn, winter
interface Q {
  q: string;
  hint: string;
  options: { label: string; sub: string; w: W }[];
}

const QUESTIONS: Q[] = [
  {
    q: "Choose an hour.",
    hint: "The light you would live in, if you could choose.",
    options: [
      { label: "First light", sub: "Dew still on the leaves", w: [3, 1, 0, 0] },
      { label: "High noon", sub: "Sun on white stone", w: [0, 3, 1, 0] },
      { label: "The golden hour", sub: "Long shadows, copper sky", w: [0, 1, 3, 0] },
      { label: "Midnight", sub: "Stars and silence", w: [0, 0, 1, 3] },
    ],
  },
  {
    q: "Choose a texture.",
    hint: "What would you like to feel against your skin?",
    options: [
      { label: "Petals", sub: "Soft, cool, barely there", w: [3, 0, 0, 1] },
      { label: "Warm linen", sub: "Salt-dried and sunlit", w: [1, 3, 0, 0] },
      { label: "Velvet", sub: "Heavy, warm, enveloping", w: [0, 0, 3, 1] },
      { label: "Cashmere & smoke", sub: "Quiet and close", w: [0, 0, 1, 3] },
    ],
  },
  {
    q: "Where do you go to think?",
    hint: "A place that makes you more yourself.",
    options: [
      { label: "A garden after rain", sub: "Everything beginning again", w: [3, 0, 0, 0] },
      { label: "A terrace above the sea", sub: "Nowhere to be", w: [0, 3, 0, 0] },
      { label: "A library at dusk", sub: "Old paper and lamplight", w: [0, 0, 3, 1] },
      { label: "A frozen lake", sub: "Absolute stillness", w: [0, 0, 0, 3] },
    ],
  },
  {
    q: "Choose a palette.",
    hint: "Trust the first colours that call to you.",
    options: [
      { label: "Blush & pistachio", sub: "Tender and new", w: [3, 0, 0, 0] },
      { label: "Gold & turquoise", sub: "Radiant and free", w: [0, 3, 0, 0] },
      { label: "Copper & burgundy", sub: "Rich and burnished", w: [0, 0, 3, 0] },
      { label: "Midnight & silver", sub: "Cool and luminous", w: [0, 0, 0, 3] },
    ],
  },
  {
    q: "How should a scent be felt?",
    hint: "The trail you would like to leave behind.",
    options: [
      { label: "A whisper", sub: "Discovered only up close", w: [2, 0, 0, 1] },
      { label: "A radiance", sub: "Felt across the room", w: [0, 3, 0, 0] },
      { label: "An embrace", sub: "Warm and lingering", w: [0, 0, 3, 0] },
      { label: "A mystery", sub: "Remembered long after", w: [0, 0, 1, 3] },
    ],
  },
];
const SWATCH = [
  ["#f2cfcf", "#cfdcb8"],
  ["#e9b949", "#3fb4b4"],
  ["#b8653a", "#5e1f24"],
  ["#0d1626", "#c5ccd6"],
];

export function Discover() {
  const [step, setStep] = useState(-1); // -1 intro, 0..4 questions, 5 result
  const [answers, setAnswers] = useState<number[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const bag = useBag();

  const scores = useMemo(() => {
    const s: W = [0, 0, 0, 0];
    answers.forEach((a, qi) => QUESTIONS[qi].options[a].w.forEach((v, k) => (s[k] += v)));
    return s;
  }, [answers]);
  const total = scores.reduce((a, b) => a + b, 0) || 1;
  const lead = scores.indexOf(Math.max(...scores));
  // ties are broken by the most recent answer's strongest season
  const winner = useMemo(() => {
    const max = Math.max(...scores);
    const tied = scores.map((v, i) => (v === max ? i : -1)).filter((i) => i >= 0);
    if (tied.length === 1 || !answers.length) return tied[0] ?? 0;
    const last = QUESTIONS[answers.length - 1].options[answers[answers.length - 1]].w;
    return tied.sort((a, b) => last[b] - last[a])[0];
  }, [scores, answers]);
  const f = FRAGRANCES[winner];
  const second = FRAGRANCES[[0, 1, 2, 3].filter((i) => i !== winner).sort((a, b) => scores[b] - scores[a])[0]];

  useEffect(() => {
    setWorldUi({ visible: true });
    const t = step === -1 ? 0 : answers.length ? FRAGRANCES[step === 5 ? winner : lead].worldT : 0.08;
    const mobile = window.matchMedia("(max-width: 820px)").matches;
    flyTo(t, { frame: mobile ? 0 : step === 5 ? 0.42 : step === -1 ? 0.5 : 0.36 });
    document.documentElement.dataset.tone = step >= 0 && (step === 5 ? winner : lead) >= 2 && answers.length ? "light" : "dark";
    return () => {
      document.documentElement.dataset.tone = "dark";
    };
  }, [step, lead, winner, answers.length]);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll(".line > span"), { yPercent: 118 }, { yPercent: 0, duration: step === 5 ? 1.8 : 1.2, stagger: 0.08, ease: "expo.out", delay: step === 5 ? 0.9 : step === -1 ? 1 : 0.1 });
      gsap.fromTo(el.querySelectorAll(".fade"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06, ease: "expo.out", delay: step === 5 ? 1.4 : 0.25 });
      if (step === 5) gsap.fromTo(el.querySelectorAll(".bar i"), { scaleX: 0 }, { scaleX: 1, duration: 1.6, stagger: 0.1, ease: "expo.out", delay: 1.8 });
    }, el);
    return () => ctx.revert();
  }, [step]);

  const choose = (k: number) => {
    const next = [...answers.slice(0, step), k];
    setAnswers(next);
    setStep(step + 1 >= QUESTIONS.length ? 5 : step + 1);
  };
  const restart = () => {
    setAnswers([]);
    setStep(0);
  };

  return (
    <main className="page discover">
      <div className="disc-stage container-x" ref={stage} key={step}>
        {step === -1 && (
          <div className="disc-intro">
            <span className="eyebrow fade">Discover · Five questions</span>
            <h1 className="display disc-title">
              <span className="line"><span>Which season</span></span>
              <span className="line"><span><em>are you?</em></span></span>
            </h1>
            <p className="body-copy fade">Answer by instinct. As you choose, the world behind you will begin to turn towards your season.</p>
            <div className="fade">
              <button className="btn btn-solid" onClick={() => setStep(0)}>
                Begin <Arrow />
              </button>
            </div>
          </div>
        )}

        {step >= 0 && step < 5 && (
          <div className="disc-q">
            <div className="disc-progress fade">
              {QUESTIONS.map((_, i) => (
                <span key={i} data-on={i <= step} />
              ))}
              <span className="eyebrow">{step + 1} / {QUESTIONS.length}</span>
            </div>
            <h2 className="display disc-question">
              <span className="line"><span>{QUESTIONS[step].q}</span></span>
            </h2>
            <p className="body-copy fade">{QUESTIONS[step].hint}</p>
            <div className="disc-options">
              {QUESTIONS[step].options.map((o, k) => (
                <button key={o.label} className="disc-opt fade" onClick={() => choose(k)} data-picked={answers[step] === k}>
                  {step === 3 ? (
                    <span className="disc-swatch" style={{ background: `linear-gradient(135deg, ${SWATCH[k][0]} 50%, ${SWATCH[k][1]} 50%)` }} />
                  ) : (
                    <span className="eyebrow disc-opt-n">0{k + 1}</span>
                  )}
                  <span className="serif disc-opt-label">{o.label}</span>
                  <span className="disc-opt-sub">{o.sub}</span>
                </button>
              ))}
            </div>
            {step > 0 && (
              <button className="eyebrow link-u fade disc-back" onClick={() => setStep(step - 1)}>
                ← Previous question
              </button>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="disc-result">
            <span className="eyebrow fade">Your season is {f.seasonLabel.toLowerCase()} · {f.frenchSeason}</span>
            <h2 className="display disc-name">
              <span className="line"><span>{f.name}</span></span>
            </h2>
            <p className="display italic disc-tag">
              <span className="line"><span>{f.tagline}</span></span>
            </p>
            <p className="body-copy fade">
              You are drawn to {f.theme.toLowerCase().replace(/\.$/, "")}. Your second season is {second.seasonLabel.toLowerCase()} — try{" "}
              <TLink href={`/fragrance/${second.slug}`} className="link-u serif italic" style={{ fontSize: "1.15em" }}>{second.name}</TLink> when you want to become someone else for a while.
            </p>
            <div className="disc-bars fade">
              {FRAGRANCES.map((x, i) => (
                <div key={x.slug} className="bar" data-win={i === winner}>
                  <span className="eyebrow"><SeasonMark active={i} size={12} /> {x.seasonLabel}</span>
                  <span className="bar-track"><i style={{ width: `${(scores[i] / total) * 100}%` }} /></span>
                  <span className="eyebrow">{Math.round((scores[i] / total) * 100)}%</span>
                </div>
              ))}
            </div>
            <div className="disc-cta fade">
              <TLink href={`/fragrance/${f.slug}`} className="btn btn-solid">
                Discover {f.name} <Arrow />
              </TLink>
              <button className="btn" onClick={() => { bag.add({ slug: f.slug, size: f.prices[0].size, price: f.prices[0].price }); bag.setOpen(true); }}>
                Add · {formatPrice(f.prices[0].price)}
              </button>
              <button className="eyebrow link-u" onClick={restart}>Retake</button>
            </div>
            <div className="disc-thumb fade">
              <Image src={f.bottle} alt={`${f.name} flacon`} width={150} height={188} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
