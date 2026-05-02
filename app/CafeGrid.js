"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ScrollFadeUp from "./components/ScrollFadeUp";

function StarRating({ rating }) {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return (
    <span className="text-brass text-sm tracking-wide">
      {"★".repeat(full)}{"☆".repeat(empty)}
      <span className="text-cream/50 text-xs ml-1.5 font-sans">{rating}</span>
    </span>
  );
}

function getCafeCategory(cafe) {
  const tagline = cafe.tagline || "";
  if (tagline.includes("Melbourne")) return "melbourne";
  if (/こだわり/.test(tagline) || /[぀-鿿]/.test(tagline)) return "hiroshima";
  return "other";
}

function getDisplayTagline(cafe) {
  const tagline = cafe.tagline || "";
  if (!tagline.includes("Melbourne")) return tagline;
  const line2 = cafe.address?.line2 || "";
  if (line2.toLowerCase().includes("melbourne")) return tagline;
  const suburb = line2.split(/\s+VIC\s+/i)[0].trim();
  if (suburb && suburb.length > 2 && suburb !== line2) {
    return `Specialty coffee in ${suburb}.`;
  }
  return "Your neighbourhood specialty coffee.";
}

const FILTERS = [
  { id: "all",       label: "すべて" },
  { id: "melbourne", label: "メルボルンカフェ" },
  { id: "hiroshima", label: "広島カフェ" },
  { id: "other",     label: "その他" },
];

export default function CafeGrid({ cafes }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? cafes
    : cafes.filter((c) => getCafeCategory(c) === filter);

  const counts = {
    all:       cafes.length,
    melbourne: cafes.filter((c) => getCafeCategory(c) === "melbourne").length,
    hiroshima: cafes.filter((c) => getCafeCategory(c) === "hiroshima").length,
    other:     cafes.filter((c) => getCafeCategory(c) === "other").length,
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-16 pb-24">
      <div className="text-center mb-12">
        <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-3">
          {filtered.length} cafes
        </p>
        <h2 className="font-serif text-4xl text-forest">Browse All Demos</h2>
        <div className="w-16 h-px bg-brass mx-auto my-6" />

        {/* ── Filter buttons ── */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`font-sans text-sm tracking-wide px-5 py-2 border transition-all duration-300 ${
                filter === id
                  ? "bg-forest text-cream border-forest"
                  : "bg-transparent text-charcoal border-beige hover:border-brass hover:text-brass"
              }`}
            >
              {label}
              <span className="ml-1.5 text-xs opacity-60">({counts[id]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((cafe, i) => {
          // Cap stagger at 0.24s so the 133rd card doesn't wait 10 seconds
          const baseDelay = Math.min(i * 0.07, 0.24);
          return (
            <ScrollFadeUp key={cafe.slug} delay={baseDelay}>
              <Link href={`/${cafe.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden border border-beige group-hover:border-brass transition-colors duration-300">
                  <Image
                    src={cafe.heroImage}
                    alt={cafe.name}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent" />
                  {/* Text overlay: extra delay → floats up after the image card */}
                  <ScrollFadeUp
                    delay={baseDelay + 0.14}
                    distance={20}
                    className="absolute bottom-0 left-0 right-0"
                  >
                    <div className="p-5">
                      <p className="font-sans text-xs tracking-widest uppercase text-brass mb-1 opacity-90">
                        {cafe.eyebrow}
                      </p>
                      <h3 className="font-serif text-xl text-cream leading-snug">
                        {cafe.name}
                      </h3>
                      <div className="mt-1.5">
                        <StarRating rating={cafe.rating} />
                      </div>
                    </div>
                  </ScrollFadeUp>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-sans text-xs tracking-widest uppercase bg-brass text-charcoal px-3 py-1">
                      View Demo
                    </span>
                  </div>
                </div>
                <div className="border border-t-0 border-beige group-hover:border-brass px-5 py-3 transition-colors duration-300 bg-white">
                  <p className="font-sans text-xs text-charcoal/60 leading-relaxed truncate">
                    {getDisplayTagline(cafe)}
                  </p>
                </div>
              </Link>
            </ScrollFadeUp>
          );
        })}
      </div>
    </main>
  );
}
