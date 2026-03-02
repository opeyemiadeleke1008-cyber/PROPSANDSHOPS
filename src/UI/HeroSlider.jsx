import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "../Components/Button";
import { Link } from "react-router-dom";

export default function HeroSlider() {
  const images = useMemo(
    () => [
      "https://images.unsplash.com/photo-1570374174281-68e0dfc8bca9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvcHN8ZW58MHx8MHx8fDA%3D",
      "https://plus.unsplash.com/premium_photo-1714638206741-f9fa60a64fca?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cHJvcHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1715690999157-f25f68d0fd31?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHByb3BzfGVufDB8fDB8fHww",
    ],
    [],
  );

  const INTERVAL_MS = 3500;
  const PAUSE_AFTER_MANUAL_MS = 3500;

  const [index, setIndex] = useState(0);
  const pauseUntilRef = useRef(0);

  const goTo = (next) => {
    setIndex((prev) => {
      const n = typeof next === "function" ? next(prev) : next;
      return (n + images.length) % images.length;
    });
  };

  const next = () => {
    pauseUntilRef.current = Date.now() + PAUSE_AFTER_MANUAL_MS;
    goTo((i) => i + 1);
  };

  const prev = () => {
    pauseUntilRef.current = Date.now() + PAUSE_AFTER_MANUAL_MS;
    goTo((i) => i - 1);
  };

  // Autoplay
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      goTo((i) => i + 1);
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [images.length]);

  // Optional: keyboard controls
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section className="relative flex h-[500px] w-full min-h-[420px] items-center justify-center overflow-hidden text-white">
      {/* Background layers (crossfade) */}
      {images.map((src, i) => (
        <div
          key={src}
          aria-hidden="true"
          className={[
            "absolute inset-0 bg-cover bg-center transition-opacity duration-500 will-change-[opacity]",
            i === index ? "opacity-100" : "opacity-0",
          ].join(" ")}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}

      {/* Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-black/65 to-black/15"
      />

      {/* Content */}
      <div className="relative z-2 w-[min(900px,92%)] text-left">
        <h1
          className="uppercase text-2xl font-bold"
          style={{ fontFamily: '"Orbitron"' }}
        >
          feel confident in your shopping
        </h1>
        <h1 className="m-0 text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] uppercase">
          Haven Home of props
        </h1>
        <p
          className="mt-3 max-w-[520px] text-sm md:text-[clamp(1rem,1.3vw,1.2rem)]"
          style={{ fontFamily: '"Cascadia Mono"' }}
        >
          Where artistry meets authenticity. We don’t just make props; we forge
          artifacts. Using the same techniques and materials as the industry's
          top studios, every item in our collection is built to withstand a
          hero's journey.
        </p>
        <Link to="/signin">
          <Button className="mt-4 uppercase bg-transparent border border-white text-white hover:bg-white hover:text-black text-md">
            Explore Collection
          </Button>
        </Link>
      </div>

      {/* Left arrow */}
      <ChevronLeft
        size={25}
        strokeWidth={3}
        onClick={prev}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") prev();
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 sm:grid md:p-3 p-2 bg-white border border-black rounded-full cursor-pointer text-black box-content hidden"
      />

      {/* Right arrow */}
      <ChevronRight
        size={25}
        strokeWidth={3}
        onClick={next}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") next();
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 sm:grid md:p-3 p-2 bg-white border border-black rounded-full cursor-pointer text-black box-content hidden"
      />

      {/* Dots (optional) */}
      <div className="absolute bottom-3 left-0 right-0 z-3 flex justify-center gap-2.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => {
              pauseUntilRef.current = Date.now() + PAUSE_AFTER_MANUAL_MS;
              goTo(i);
            }}
            className={[
              "h-2.5 w-2.5 rounded-full bg-white transition",
              i === index ? "scale-110 opacity-100" : "opacity-60",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}
