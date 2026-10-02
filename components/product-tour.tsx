"use client";
import Image from "next/image";
import {
  ArrowsOut,
  ChartLine,
  ListMagnifyingGlass,
  Stack,
  X,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";
import overviewImage from "@/public/images/observer-metrics.png";
import questionsImage from "@/public/images/observer-questions.png";
import requestImage from "@/public/images/observer-live.png";
const views = [
  {
    id: "overview",
    title: "Overview",
    icon: ChartLine,
    image: overviewImage,
    description: "Latency, usage, and failures. One shared history.",
    alt: "Jev Observer overview showing synthetic sample requests, latency metrics, question groups, and recent requests.",
  },
  {
    id: "questions",
    title: "Question groups",
    icon: Stack,
    image: questionsImage,
    description:
      "Follow recurring questions without mixing different definitions.",
    alt: "Jev Observer question group detail showing the support_routing question, answer distribution, and definition versions in sample data.",
  },
  {
    id: "requests",
    title: "Request details",
    icon: ListMagnifyingGlass,
    image: requestImage,
    description:
      "Inspect typed answers, probabilities, and the request behind them.",
    alt: "Jev Observer request detail showing a synthetic request, typed answers, and outcome probabilities.",
  },
];
export function ProductTour() {
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const view = views[selected];
  function keyDown(event: React.KeyboardEvent, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % views.length;
    else if (event.key === "ArrowLeft")
      next = (index + views.length - 1) % views.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = views.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }
  return (
    <div className="product-tour">
      <div className="tour-toolbar">
        <div className="tour-tabs" role="tablist" aria-label="Dashboard views">
          {views.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={selected === index}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected === index ? 0 : -1}
              onKeyDown={(event) => keyDown(event, index)}
              onClick={() => setSelected(index)}
            >
              <item.icon
                size={18}
                weight={selected === index ? "duotone" : "regular"}
              />
              {item.title}
            </button>
          ))}
        </div>
        <button
          className="icon-button expand-button"
          type="button"
          onClick={(event) => {
            event.currentTarget.focus();
            dialog.current?.showModal();
          }}
          aria-label="Expand screenshot"
          title="Expand screenshot"
        >
          <ArrowsOut size={19} />
        </button>
      </div>
      {views.map((item, index) => (
        <div
          key={item.id}
          className="tour-panel"
          role="tabpanel"
          id={`panel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
          hidden={selected !== index}
          tabIndex={0}
        >
          {selected === index && (
            <div className="tour-transition">
              <Image
                src={item.image}
                width={2160}
                height={1425}
                sizes="(max-width: 768px) calc(100vw - 44px), (max-width: 1248px) calc(100vw - 80px), 1168px"
                alt={item.alt}
                quality={90}
              />
            </div>
          )}
        </div>
      ))}
      <div className="tour-caption">
        <p aria-live="polite">{view.description}</p>
        <span>Real dashboard. Synthetic sample data.</span>
      </div>
      <dialog
        ref={dialog}
        className="image-dialog"
        aria-label={`${view.title} screenshot`}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="image-dialog-inner">
          <div className="image-dialog-header">
            <span>
              {view.title} <small>Synthetic sample data</small>
            </span>
            <button
              type="button"
              className="icon-button"
              aria-label="Close screenshot"
              onClick={() => dialog.current?.close()}
            >
              <X size={22} />
            </button>
          </div>
          <div
            className="image-dialog-viewport"
            tabIndex={0}
            role="region"
            aria-label="Screenshot details"
          >
            <Image
              src={view.image}
              width={2160}
              height={1425}
              alt={view.alt}
              loading="lazy"
              unoptimized
            />
          </div>
        </div>
      </dialog>
    </div>
  );
}
