"use client";

import { useEffect, useRef, useState } from "react";
import {
  Aperture,
  ArrowClockwise,
  ArrowRight,
  BracketsCurly,
  Check,
  Code,
  Pause,
  Play,
} from "@phosphor-icons/react";
import styles from "./hero-flow.module.css";

// Answers from the application's synthetic Support inbox sample (record 5).
const examples = [
  {
    id: "routing",
    label: "Routing",
    type: "Choice",
    question: "Which team should handle this ticket?",
    answer: "Technical",
    detail: "Bugs and outages",
    values: ["Billing 10%", "Technical 80%", "Sales 10%"],
  },
  {
    id: "urgency",
    label: "Urgency",
    type: "Probability",
    question: "Does the customer need a response today?",
    answer: "88%",
    detail: "Reported probability",
    values: ["Model output, not measured accuracy"],
  },
  {
    id: "frustration",
    label: "Frustration",
    type: "Score",
    question: "How frustrated is the customer?",
    answer: "1.7 / 2",
    detail: "From calm to very angry",
    values: ["Calm 10%", "Frustrated 10%", "Very angry 80%"],
  },
];

const paths = [
  "M 52 102 C 120 102, 150 78, 240 78 L 300 78 C 390 78, 414 102, 488 102",
  "M 488 126 C 414 126, 390 150, 300 150 L 240 150 C 150 150, 120 126, 52 126",
  "M 270 150 L 270 227",
];

export function HeroFlow() {
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replay, setReplay] = useState(0);
  const pausedRef = useRef(false);
  const syncPlayback = useRef<(() => void) | null>(null);
  const figure = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const example = examples[selected];

  useEffect(() => {
    const graphic = svg.current;
    const root = figure.current;
    if (!graphic || !root) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    let visible = true;
    const sync = () => {
      const running =
        !pausedRef.current && !media.matches && visible && !document.hidden;
      root.dataset.running = String(running);
      animations.forEach((animation) => {
        if (running) animation.play();
        else animation.pause();
      });
    };
    const create = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
      if (!media.matches) {
        graphic
          .querySelectorAll<SVGPathElement>("[data-flow-path]")
          .forEach((path, index) => {
            const length = path.getTotalLength();
            const frames = Array.from({ length: 61 }, (_, step) => {
              const point = path.getPointAtLength((step / 60) * length);
              return {
                transform: `translate(${point.x}px, ${point.y}px)`,
                opacity: step === 0 || step === 60 ? 0 : 1,
              };
            });
            graphic
              .querySelectorAll<SVGCircleElement>(`[data-particle="${index}"]`)
              .forEach((particle, particleIndex) => {
                const animation = particle.animate(frames, {
                  duration: index === 2 ? 1600 : 4200,
                  delay: particleIndex * -2100 + index * -900,
                  iterations: Infinity,
                  easing: "linear",
                });
                animations.push(animation);
              });
          });
      }
      sync();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    syncPlayback.current = sync;
    observer.observe(root);
    create();
    media.addEventListener("change", create);
    document.addEventListener("visibilitychange", sync);
    return () => {
      animations.forEach((animation) => animation.cancel());
      observer.disconnect();
      media.removeEventListener("change", create);
      document.removeEventListener("visibilitychange", sync);
      syncPlayback.current = null;
    };
  }, [replay]);

  useEffect(() => {
    pausedRef.current = paused;
    syncPlayback.current?.();
  }, [paused]);

  function replayRequest() {
    setPaused(false);
    setReplay((value) => value + 1);
  }

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
      <div className={styles.toolbar}>
        <span>Follow a request</span>
        <button
          className={styles.motionControl}
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={
            paused ? "Play request animation" : "Pause request animation"
          }
          title={paused ? "Play animation" : "Pause animation"}
        >
          {paused ? (
            <Play size={15} weight="fill" />
          ) : (
            <Pause size={15} weight="fill" />
          )}
        </button>
      </div>

      <div className={styles.diagram}>
        <div className={styles.nodeLabels} aria-hidden="true">
          <span>Your application</span>
          <span>Observer</span>
          <span>Your provider</span>
        </div>
        <svg
          ref={svg}
          className={styles.paths}
          viewBox="0 0 540 235"
          fill="none"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <path
              key={index}
              className={styles.echoPath}
              d={`M 52 ${66 + index * 24} C 150 ${66 + index * 24}, 170 114, 270 114 C 370 114, 390 ${66 + index * 24}, 488 ${66 + index * 24}`}
            />
          ))}
          {paths.map((path, index) => (
            <g key={path}>
              <path
                d={path}
                data-flow-path
                className={index === 2 ? styles.capturePath : styles.activePath}
              />
              <circle
                r="3.5"
                data-particle={index}
                className={styles.particle}
              />
              {index < 2 && (
                <circle
                  r="2.5"
                  data-particle={index}
                  className={styles.particle}
                />
              )}
            </g>
          ))}
          <text x="146" y="64" className={styles.pathLabel}>
            request
          </text>
          <text x="376" y="180" className={styles.pathLabel}>
            response
          </text>
        </svg>
        <div
          className={`${styles.endpoint} ${styles.application}`}
          aria-hidden="true"
        >
          <Code size={24} />
        </div>
        <button
          className={styles.observer}
          type="button"
          onClick={replayRequest}
          aria-label="Replay sample request"
          title="Replay sample request"
        >
          <span className={styles.observerHalo} />
          <Aperture
            size={38}
            weight="duotone"
            className={styles.observerIcon}
          />
          <ArrowClockwise size={17} className={styles.replayIcon} />
        </button>
        <div
          className={`${styles.endpoint} ${styles.provider}`}
          aria-hidden="true"
        >
          <BracketsCurly size={24} />
        </div>
        <div className={styles.captureLabel}>
          <Check size={13} weight="bold" /> Captured locally
        </div>
      </div>

      <div className={styles.inspector}>
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
            <div className={styles.questionRow}>
              <p>{example.question}</p>
              <span className={styles.type}>{example.type}</span>
            </div>
            <div className={styles.result}>
              <ArrowRight size={20} />
              <strong>{example.answer}</strong>
              <span>{example.detail}</span>
            </div>
            <div className={styles.distribution}>
              {example.values.map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>
        <span>Synthetic sample data</span>
        <span>
          Choose a question to inspect <ArrowRight size={12} />
        </span>
      </figcaption>
    </figure>
  );
}
