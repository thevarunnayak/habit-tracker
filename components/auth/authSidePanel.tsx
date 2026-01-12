import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import Autoplay from "embla-carousel-autoplay";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { Cover } from "@/components/ui/cover"; // ✅ Aeternity UI

type Quote = {
  text: string;
  author?: string;
};

type AuthSidePanelProps = {
  title?: string;
  subtitle?: string;
  points?: string[];
  mobileTagline?: string;
  quotes?: Quote[];
};

function splitTitleForCover(title: string) {
  // Normalize whitespace but preserve new lines
  const raw = title.trim();

  // Split by spaces but keep line breaks within chunks
  // (we just need last word)
  const parts = raw.split(" ").filter(Boolean);

  if (parts.length === 0) return { prefix: "", last: "" };
  if (parts.length === 1) return { prefix: "", last: parts[0] };

  const last = parts[parts.length - 1];
  const prefix = parts.slice(0, -1).join(" ");

  return { prefix, last };
}

export default function AuthSidePanel({
  title = "Build habits.\nStay consistent.",
  subtitle = "Habithop helps you track your daily routines, build streaks, and stay accountable — without distractions.",
  points = [
    "Streak-based tracking designed to keep you motivated.",
    "Minimal, distraction-free UI so you focus on doing, not managing.",
    "Built for daily use on mobile + desktop.",
  ],
  mobileTagline = "Build habits. Stay consistent.",
  quotes = [
    {
      text: "Consistency beats motivation. Habithop made it easy for me to track and stick to my habits.",
      author: "A Habithop user",
    },
    {
      text: "Clean UI and fast. I check in daily without thinking.",
      author: "Habithop user",
    },
    {
      text: "The streak tracking feature is addictive (in a good way).",
      author: "Habithop user",
    },
  ],
}: AuthSidePanelProps) {
  const autoplayDelay = 4500;

  const autoplay = useRef(
    Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: false,
    })
  );

  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  const { prefix, last } = useMemo(() => splitTitleForCover(title), [title]);

  useEffect(() => {
    if (!api) return;

    const update = () => {
      setActiveIndex(api.selectedScrollSnap());
      setProgressKey((k) => k + 1);
    };

    update();
    api.on("select", update);

    return () => {
      api.off("select", update);
    };
  }, [api]);

  return (
    <>
      {/* Desktop Left Panel */}
      <div className="hidden lg:flex flex-col justify-center px-10 py-12 lg:pr-12">
        <div className="max-w-md">
          {/* Brand */}
          <Image
            src="/habithop-logo.png"
            alt="Habithop"
            width={160}
            height={40}
            priority
            className="h-9 w-auto"
          />

          {/* ✅ Title (auto cover last word) */}
          <h1 className="mt-9 text-4xl font-semibold tracking-tight text-zinc-900 leading-tight">
            <span className="whitespace-pre-line">{prefix} </span>
            <Cover className="inline-block">{last}</Cover>
          </h1>

          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            {subtitle}
          </p>

          {/* Feature points */}
          <div className="mt-8 space-y-4 text-sm text-zinc-700">
            {points.map((p, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-900" />
                <p className="leading-relaxed">{p}</p>
              </div>
            ))}
          </div>

          {/* Quote carousel */}
          {quotes?.length ? (
            <div className="mt-10">
              <Carousel
                opts={{ loop: true }}
                plugins={[autoplay.current]}
                setApi={setApi}
                className="w-full"
              >
                <CarouselContent>
                  {quotes.map((q, i) => (
                    <CarouselItem key={i}>
                      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-sm">
                        <p className="text-sm text-zinc-700 leading-relaxed">
                          “{q.text}”
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">
                          — {q.author ?? "Habithop user"}
                        </p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Dots with progress ring */}
              {quotes.length > 1 ? (
                <div className="mt-4 flex items-center gap-2">
                  {quotes.map((_, i) => {
                    const isActive = i === activeIndex;

                    return (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Go to quote ${i + 1}`}
                        onClick={() => api?.scrollTo(i)}
                        className="relative h-3 w-3 rounded-full"
                      >
                        <span
                          className={[
                            "absolute inset-0 rounded-full transition",
                            isActive
                              ? "bg-zinc-900"
                              : "bg-zinc-300 hover:bg-zinc-400",
                          ].join(" ")}
                        />

                        {isActive ? (
                          <svg
                            key={progressKey}
                            className="absolute -inset-1"
                            viewBox="0 0 36 36"
                          >
                            <path
                              d="M18 2.5 a 15.5 15.5 0 1 1 0 31 a 15.5 15.5 0 1 1 0 -31"
                              fill="none"
                              stroke="rgba(24,24,27,0.12)"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.5 a 15.5 15.5 0 1 1 0 31 a 15.5 15.5 0 1 1 0 -31"
                              fill="none"
                              stroke="rgba(24,24,27,0.9)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray="100"
                              strokeDashoffset="100"
                              style={{
                                animation: `habithop-ring ${
                                  autoplayDelay / 1000
                                }s linear forwards`,
                              }}
                            />
                          </svg>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <style jsx>{`
                @keyframes habithop-ring {
                  from {
                    stroke-dashoffset: 100;
                  }
                  to {
                    stroke-dashoffset: 0;
                  }
                }
              `}</style>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden my-8 text-center">
        <div className="flex items-center justify-center">
          <Image
            src="/habithop-logo.png"
            alt="Habithop"
            width={160}
            height={40}
            priority
            className="h-9 w-auto"
          />
        </div>

        <p className="mt-3 text-sm text-zinc-600">{mobileTagline}</p>
      </div>
    </>
  );
}
