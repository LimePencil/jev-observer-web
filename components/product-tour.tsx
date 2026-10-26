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
import { site } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
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
    alt: "Jev Observer overview showing synthetic sample requests, latency metrics, known token coverage, question groups, and recent requests.",
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
const koreanViews = views.map((view, index) => ({
  ...view,
  ...[
    {
      title: "개요",
      description: "지연 시간, 사용량, 실패를 하나의 기록에서 확인하세요.",
      alt: "합성 샘플 요청, 지연 시간 지표, 확인된 토큰의 집계 범위, 질문 그룹, 최근 요청이 표시된 Jev Observer 영문 개요 화면.",
    },
    {
      title: "질문 그룹",
      description: "서로 다른 정의를 섞지 않고 반복되는 질문을 추적하세요.",
      alt: "샘플 데이터의 support_routing 질문, 답변 분포, 정의 버전이 표시된 Jev Observer 영문 질문 그룹 상세 화면.",
    },
    {
      title: "요청 상세",
      description: "타입별 답변과 확률, 해당 요청을 함께 살펴보세요.",
      alt: "합성 요청, 타입별 답변, 결과 확률이 표시된 Jev Observer 영문 요청 상세 화면.",
    },
  ][index],
}));
export function ProductTour({ locale = "en" }: { locale?: Locale }) {
  const korean = locale === "ko";
  const localizedViews = korean ? koreanViews : views;
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const view = localizedViews[selected];
  function keyDown(event: React.KeyboardEvent, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % localizedViews.length;
    else if (event.key === "ArrowLeft")
      next = (index + localizedViews.length - 1) % localizedViews.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = localizedViews.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }
  return (
    <div className="product-tour">
      <div className="tour-toolbar">
        <div
          className="tour-tabs"
          role="tablist"
          aria-label={korean ? "대시보드 보기" : "Dashboard views"}
        >
          {localizedViews.map((item, index) => (
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
          aria-label={korean ? "스크린샷 확대" : "Expand screenshot"}
          title={korean ? "스크린샷 확대" : "Expand screenshot"}
        >
          <ArrowsOut size={19} />
        </button>
      </div>
      {localizedViews.map((item, index) => (
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
        <span>
          Observer {site.version}.{" "}
          {korean ? "영문 UI · 합성 샘플 데이터." : "Synthetic sample data."}
        </span>
      </div>
      <dialog
        ref={dialog}
        className="image-dialog"
        aria-label={`${view.title} ${korean ? "스크린샷" : "screenshot"}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="image-dialog-inner">
          <div className="image-dialog-header">
            <span>
              {view.title}{" "}
              <small>
                {korean
                  ? "영문 UI · 합성 샘플 데이터"
                  : "Synthetic sample data"}
              </small>
            </span>
            <button
              type="button"
              className="icon-button"
              aria-label={korean ? "스크린샷 닫기" : "Close screenshot"}
              onClick={() => dialog.current?.close()}
            >
              <X size={22} />
            </button>
          </div>
          <div
            className="image-dialog-viewport"
            tabIndex={0}
            role="region"
            aria-label={korean ? "스크린샷 상세" : "Screenshot details"}
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
