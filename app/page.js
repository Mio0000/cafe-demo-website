import Link from "next/link";
import Image from "next/image";
import { getAllCafes } from "../lib/cafes.js";

export const metadata = {
  title: "Cafe Demos — Portfolio",
  description: "Professional cafe websites for Melbourne and Hiroshima.",
};

function LeadlightDiamond() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="6" y="0" width="8" height="8" transform="rotate(45 6 0)" fill="#D4AF37" fillOpacity="0.8" />
    </svg>
  );
}

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

export default function HomePage() {
  const cafes = getAllCafes();

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Hero header ── */}
      <header className="relative bg-charcoal py-24 text-center overflow-hidden">
        <div className="leadlight-strip h-1 w-full absolute top-0 left-0 right-0" />

        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none">
          <div className="absolute left-8 md:left-20 top-1 bottom-0 w-px bg-gradient-to-b from-brass/0 via-brass/30 to-brass/0" />
          <div className="absolute right-8 md:right-20 top-1 bottom-0 w-px bg-gradient-to-b from-brass/0 via-brass/30 to-brass/0" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-6">
            Demo Portfolio · Cafe Websites
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-cream leading-tight mb-4">
            Cafe
            <br />
            <span className="italic text-brass">Demos</span>
          </h1>
          <div className="flex items-center justify-center gap-4 my-6">
            <div className="h-px w-12 bg-brass/60" />
            <LeadlightDiamond />
            <div className="h-px w-12 bg-brass/60" />
          </div>
          <p className="font-sans text-cream/60 leading-relaxed">
            Custom-built demo websites for cafes across Melbourne &amp; Hiroshima.
            <br className="hidden md:block" />
            Click any cafe to explore its full site.
          </p>
        </div>

        <div className="leadlight-strip h-px w-full absolute bottom-0 left-0 right-0" />
      </header>

      {/* ── Cafe grid ── */}
      <main className="max-w-6xl mx-auto px-6 py-16 pb-24">
        <div className="text-center mb-12">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-3">
            {cafes.length} cafes
          </p>
          <h2 className="font-serif text-4xl text-forest">Browse All Demos</h2>
          <div className="w-16 h-px bg-brass mx-auto my-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cafes.map((cafe) => (
            <Link
              key={cafe.slug}
              href={`/${cafe.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden border border-beige group-hover:border-brass transition-colors duration-300">
                <Image
                  src={cafe.heroImage}
                  alt={cafe.name}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
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
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="font-sans text-xs tracking-widest uppercase bg-brass text-charcoal px-3 py-1">
                    View Demo
                  </span>
                </div>
              </div>
              <div className="border border-t-0 border-beige group-hover:border-brass px-5 py-3 transition-colors duration-300 bg-white">
                <p className="font-sans text-xs text-charcoal/60 leading-relaxed truncate">
                  {cafe.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-charcoal py-8 text-center">
        <div className="leadlight-strip h-px w-full mb-6" />
        <p className="font-sans text-xs text-cream/30 tracking-wide">
          Demo Portfolio · {cafes.length} cafes · Melbourne &amp; Hiroshima
        </p>
      </footer>
    </div>
  );
}
