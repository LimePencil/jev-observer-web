"use client";

import { useEffect, useRef, useState } from "react";
import { Aperture, BracketsCurly, Code } from "@phosphor-icons/react";
import styles from "./hero-flow.module.css";

// Answers from sample_records()[5] in the application's synthetic Support inbox.
const examples = [
  {
    id: "routing",
    label: "Routing",
    question: "Which team should handle this ticket?",
    answer: "Technical",
    detail: "Selected team",
    distribution: "Billing 10%, Technical 80%, Sales 10%.",
  },
  {
    id: "urgency",
    label: "Urgency",
    question: "Does the customer need a response today?",
    answer: "88%",
    detail: "Response needed today",
    distribution: "Reported probability: 88%.",
  },
  {
    id: "frustration",
    label: "Frustration",
    question: "How frustrated is the customer?",
    answer: "1.7 / 2",
    detail: "Calm to very angry",
    distribution: "Calm 10%, Frustrated 10%, Very angry 80%.",
  },
];

const paths = [
  "M 52 102 C 120 102, 150 78, 240 78 L 300 78 C 390 78, 414 102, 488 102",
  "M 488 126 C 414 126, 390 150, 300 150 L 240 150 C 150 150, 120 126, 52 126",
  "M 270 150 L 270 227",
];

function AnswerGraphic({ selected }: { selected: number }) {
  return (
    <svg
      className={styles.answerGraphic}
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      {selected === 0 ? (
        <>
          {[10, 80, 10].map((value, index) => (
            <rect
              key={index}
              x={13 + index * 34}
              y={102 - value}
              width="25"
              height={value}
              rx="5"
              className={index === 1 ? styles.selectedBar : styles.bar}
              style={{ animationDelay: `${index * 90}ms` }}
            />
          ))}
        </>
      ) : selected === 1 ? (
        <>
          <circle cx="60" cy="60" r="43" className={styles.ringTrack} />
          <circle
            cx="60"
            cy="60"
            r="43"
            className={styles.ringValue}
            strokeDasharray={`${2 * Math.PI * 43 * 0.88} ${2 * Math.PI * 43}`}
            transform="rotate(-90 60 60)"
          />
          <circle cx="60" cy="60" r="9" className={styles.ringCenter} />
        </>
      ) : (
        Array.from({ length: 20 }, (_, index) => (
          <circle
            key={index}
            cx={18 + (index % 5) * 21}
            cy={25 + Math.floor(index / 5) * 23}
            r="7"
            className={index < 17 ? styles.scoreDot : styles.emptyDot}
            style={{ animationDelay: `${index * 24}ms` }}
          />
        ))
      )}
    </svg>
  );
}

export function HeroFlow() {
  const [selected, setSelected] = useState(0);
  const figure = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const example = examples[selected];

  useEffect(() => {
    const graphic = svg.current;
    const root = figure.current;
    if (!graphic || !root) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    let revealed = false;
    const reveal = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
      if (media.matches) return;
      graphic
        .querySelectorAll<SVGPathElement>("[data-flow-path]")
        .forEach((path, index) => {
          const length = path.getTotalLength();
          const frames = Array.from({ length: 41 }, (_, step) => {
            const point = path.getPointAtLength((step / 40) * length);
            return {
              transform: `translate(${point.x}px, ${point.y}px)`,
              opacity: step === 0 || step === 40 ? 0 : 1,
            };
          });
          const particle = graphic.querySelector<SVGCircleElement>(
            `[data-particle="${index}"]`,
          );
          if (particle)
            animations.push(
              particle.animate(frames, {
                duration: index === 2 ? 500 : 850,
                delay: index === 2 ? 1550 : index * 750,
                iterations: 1,
                easing: "ease-in-out",
              }),
            );
        });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || revealed) return;
        revealed = true;
        reveal();
        observer.disconnect();
      },
      { threshold: 0.15 },
    );
    const onMotionChange = () => {
      if (revealed) reveal();
    };
    observer.observe(root);
    media.addEventListener("change", onMotionChange);
    return () => {
      animations.forEach((animation) => animation.cancel());
      observer.disconnect();
      media.removeEventListener("change", onMotionChange);
    };
  }, [selected]);

  return (
    <figure
      className={styles.flow}
      ref={figure}
      aria-label="Interactive request example"
      aria-describedby="request-example-description"
    >
      <p className="sr-only" id="request-example-description">
        A sample request travels from your application through Observer to your
        provider. Observer stores captured answers locally. Choose a question to
        inspect its sample answer.
      </p>
      <div className={styles.diagram}>
        <svg
          ref={svg}
          className={styles.paths}
          viewBox="0 0 540 235"
          fill="none"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <path
              key={index}
              className={styles.echoPath}
              d={`M 52 ${42 + index * 24} C 150 ${42 + index * 24}, 170 114, 270 114 C 370 114, 390 ${42 + index * 24}, 488 ${42 + index * 24}`}
            />
          ))}
          {paths.map((path, index) => (
            <g key={path}>
              <path
                d={path}
                data-flow-path
                className={index === 2 ? styles.capturePath : styles.activePath}
              />
              <circle r="4" data-particle={index} className={styles.particle} />
            </g>
          ))}
        </svg>
        <div
          className={`${styles.endpoint} ${styles.application}`}
          aria-hidden="true"
        >
          <Code size={27} />
        </div>
        <div className={styles.observer} aria-hidden="true">
          <span className={styles.observerHalo} />
          <Aperture size={53} weight="duotone" />
        </div>
        <div
          className={`${styles.endpoint} ${styles.provider}`}
          aria-hidden="true"
        >
          <BracketsCurly size={27} />
        </div>
        <div className={styles.nodeLabels} aria-hidden="true">
          <span>Application</span>
          <strong>Observer</strong>
          <span>Provider</span>
        </div>
      </div>

      <fieldset className={styles.choices}>
        <legend className="sr-only">Choose a sample question</legend>
        {examples.map((item, index) => (
          <label key={item.id} className={styles.choice}>
            <input
              type="radio"
              name="sample-question"
              value={item.id}
              checked={selected === index}
              onChange={() => setSelected(index)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </fieldset>
      <div aria-live="polite" aria-atomic="true">
        <div className={styles.answer} key={example.id}>
          <AnswerGraphic selected={selected} />
          <div className={styles.result}>
            <p className="sr-only">
              {example.question} {example.distribution}
            </p>
            <strong>{example.answer}</strong>
            <span>{example.detail}</span>
          </div>
        </div>
      </div>
      <figcaption className={styles.caveat}>
        <span>Synthetic sample data</span>
        {selected === 1 && <span>Model output, not measured accuracy</span>}
      </figcaption>
    </figure>
  );
}
