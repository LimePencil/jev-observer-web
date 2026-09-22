"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// Content stays visible without JavaScript. The observer only adds an entry
// animation once a section is in view, and never tracks scroll position.
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    // Do not delay or reanimate the initial viewport and its LCP content.
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.add("reveal-visible");
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.classList.remove("reveal-ready", "reveal-visible");
    };
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{ "--reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
