"use client";

import Image from "next/image";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "Our Space", href: "#interior" },
  { label: "Featured", href: "#featured" },
  { label: "Visit Us", href: "#visit" },
];

const MENU_ITEMS = {
  "All Day Breakfast": [
    { name: "Big Breakfast", desc: "Eggs your way, bacon, sausage, toast, grilled tomato", price: "$22" },
    { name: "Avocado Toast", desc: "Smashed avo, feta, dukkah, poached eggs on sourdough", price: "$19" },
    { name: "Eggs Benedict", desc: "Poached eggs, hollandaise, house-cured ham", price: "$20" },
    { name: "Granola Bowl", desc: "House granola, seasonal fruit, coconut yoghurt", price: "$16" },
  ],
  Coffee: [
    { name: "Flat White", desc: "Silky microfoam, double ristretto", price: "$5" },
    { name: "Cold Brew", desc: "12-hr cold-extracted, served over ice", price: "$6" },
    { name: "Long Black", desc: "Double espresso over hot water", price: "$4.50" },
    { name: "Oat Latte", desc: "Barista oat milk, single origin", price: "$6" },
  ],
  "Light Bites": [
    { name: "Butter Croissant", desc: "Freshly baked, served warm", price: "$5" },
    { name: "Banana Bread", desc: "House-made, with whipped butter", price: "$6" },
    { name: "Acai Bowl", desc: "Blended acai, granola, fresh berries, honey", price: "$17" },
    { name: "Toasted Bagel", desc: "Cream cheese, smoked salmon, capers", price: "$14" },
  ],
};

const FEATURED = [
  {
    src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    alt: "Flat white coffee",
    label: "Perfect Flat White",
  },
  {
    src: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
    alt: "Golden butter croissant",
    label: "Fresh-baked Croissants",
  },
  {
    src: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80",
    alt: "Avocado toast with eggs",
    label: "Smashed Avo Toast",
  },
];

export default function CafeFelicePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Day Breakfast");

  return (
    <main
      className="min-h-screen"
      style={{ fontFamily: "var(--font-poppins), Inter, sans-serif", backgroundColor: "#F5F2EF", color: "#2a2a2a" }}
    >
      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: "rgba(245, 242, 239, 0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(210,105,30,0.15)" }}
      >
        <a href="#hero" className="text-xl font-semibold tracking-tight" style={{ color: "#D2691E" }}>
          Café Felice
        </a>
        <ul className="hidden md:flex gap-8">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-sm font-medium transition-colors"
                style={{ color: "#2F4F2F" }}
                onMouseEnter={(e) => (e.target.style.color = "#D2691E")}
                onMouseLeave={(e) => (e.target.style.color = "#2F4F2F")}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className="md:hidden text-2xl leading-none"
          style={{ color: "#2F4F2F" }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: "#F5F2EF" }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-2xl font-semibold"
              style={{ color: "#2F4F2F" }}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section id="hero" className="relative h-screen min-h-[600px] flex items-end">
        <Image
          src="/cafeFelice/store-exterior.jpg"
          alt="Café Felice exterior on Bourke St Melbourne"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }}
        />
        {/* Hero text */}
        <div className="relative z-10 px-8 pb-16 md:px-16 md:pb-20 max-w-3xl">
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: "#D2691E", color: "#fff" }}
          >
            Bourke St · Melbourne CBD
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
            Café<br />Felice
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light mb-6 max-w-md">
            Melbourne's favourite Bourke St breakfast spot. Great coffee, hearty food, warm vibes.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#menu"
              className="px-6 py-3 rounded-full text-sm font-semibold transition-transform hover:scale-105"
              style={{ backgroundColor: "#D2691E", color: "#fff" }}
            >
              See the Menu
            </a>
            <a
              href="#visit"
              className="px-6 py-3 rounded-full text-sm font-semibold border-2 border-white text-white transition-transform hover:scale-105"
              style={{ backgroundColor: "transparent" }}
            >
              Find Us
            </a>
          </div>
          {/* Rating pill */}
          <div className="flex items-center gap-2 mt-8">
            <span className="text-yellow-400 text-lg">★★★★★</span>
            <span className="text-white/90 text-sm font-medium">4.6 · Google Reviews</span>
          </div>
        </div>
      </section>

      {/* ── ABOUT STRIP ── */}
      <section className="py-16 px-6 text-center" style={{ backgroundColor: "#fff" }}>
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ color: "#D2691E" }}
        >
          461 Bourke St, Melbourne VIC 3000
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#2F4F2F" }}>
          Where the CBD slows down
        </h2>
        <p className="text-base md:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "#555" }}>
          Counter service · Outdoor seating · Open 7 days<br />
          Busy pros grabbing a flat white, locals lingering over eggs — Café Felice is for everyone.
        </p>
        <div className="flex justify-center gap-8 mt-10">
          {[["7am–4pm", "Mon – Fri"], ["8am–3pm", "Sat & Sun"], ["4.6 ★", "Google"]].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: "#D2691E" }}>{val}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MENU ── */}
      <section id="menu" className="py-20 px-6" style={{ backgroundColor: "#F5F2EF" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#D2691E" }}>What we serve</p>
            <h2 className="text-4xl font-bold" style={{ color: "#2F4F2F" }}>The Menu</h2>
          </div>

          {/* Blackboard photo — hero of this section */}
          <div className="rounded-2xl overflow-hidden shadow-2xl mb-12 relative">
            <div className="relative aspect-[16/9] md:aspect-[21/9]">
              <Image
                src="/cafeFelice/blackboard-menu.jpg"
                alt="Café Felice blackboard menu"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 90vw"
              />
              <div
                className="absolute bottom-0 left-0 right-0 p-6 text-white text-center"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
              >
                <p className="text-sm font-medium opacity-80">Our blackboard menu changes daily</p>
              </div>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {Object.keys(MENU_ITEMS).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
                style={
                  activeCategory === cat
                    ? { backgroundColor: "#D2691E", color: "#fff" }
                    : { backgroundColor: "#fff", color: "#2F4F2F", border: "1px solid #D2691E" }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {MENU_ITEMS[activeCategory].map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-start p-5 rounded-xl"
                style={{ backgroundColor: "#fff", border: "1px solid rgba(210,105,30,0.12)" }}
              >
                <div className="pr-4">
                  <div className="font-semibold text-sm" style={{ color: "#2F4F2F" }}>{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</div>
                </div>
                <div className="font-bold text-sm shrink-0" style={{ color: "#D2691E" }}>{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERIOR ── */}
      <section id="interior" className="py-20 px-6" style={{ backgroundColor: "#2F4F2F" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white order-2 md:order-1">
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#D2691E" }}>
                Our Space
              </p>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Grab a seat,<br />stay a while
              </h2>
              <p className="text-white/75 leading-relaxed mb-6">
                Bustling counter service, sunny outdoor tables, and a warm interior that feels like a second living room — Café Felice is built for the rhythm of Melbourne mornings.
              </p>
              <ul className="space-y-3">
                {[
                  "Outdoor seating on Bourke St",
                  "Counter service for fast weekday orders",
                  "Dog-friendly courtyard",
                  "Free WiFi all day",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                    <span style={{ color: "#D2691E" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2 aspect-[4/3] relative">
              <Image
                src="/cafeFelice/store-interior.jpg"
                alt="Café Felice warm interior"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section id="featured" className="py-20 px-6" style={{ backgroundColor: "#fff" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#D2691E" }}>From the kitchen</p>
            <h2 className="text-4xl font-bold" style={{ color: "#2F4F2F" }}>Fan Favourites</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURED.map((item) => (
              <div key={item.label} className="group rounded-2xl overflow-hidden shadow-md relative aspect-[4/5]">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 p-5"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)" }}
                >
                  <p className="text-white font-semibold text-sm">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISIT US ── */}
      <section id="visit" className="py-20 px-6" style={{ backgroundColor: "#F5F2EF" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#D2691E" }}>Come say hello</p>
          <h2 className="text-4xl font-bold mb-10" style={{ color: "#2F4F2F" }}>Find Us</h2>

          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: "📍",
                title: "Address",
                lines: ["461 Bourke St", "Melbourne VIC 3000"],
              },
              {
                icon: "🕐",
                title: "Hours",
                lines: ["Mon–Fri: 7am – 4pm", "Sat–Sun: 8am – 3pm"],
              },
              {
                icon: "📞",
                title: "Contact",
                lines: ["(03) 9000 0000", "hello@cafefelice.com.au"],
              },
            ].map((card) => (
              <div
                key={card.title}
                className="p-8 rounded-2xl text-center"
                style={{ backgroundColor: "#fff", border: "1px solid rgba(210,105,30,0.12)" }}
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <div className="font-semibold mb-2" style={{ color: "#2F4F2F" }}>{card.title}</div>
                {card.lines.map((l) => (
                  <div key={l} className="text-sm text-gray-500">{l}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Google Maps embed */}
          <div className="rounded-2xl overflow-hidden shadow-lg" style={{ height: "320px" }}>
            <iframe
              title="Café Felice location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.843434504789!2d144.9591865!3d-37.8163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642b4de49d8a9%3A0x2d6a02fa0f6a3b7!2s461%20Bourke%20St%2C%20Melbourne%20VIC%203000!5e0!3m2!1sen!2sau!4v1714447200000!5m2!1sen!2sau"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-10 px-6 text-center text-sm"
        style={{ backgroundColor: "#2F4F2F", color: "rgba(255,255,255,0.6)" }}
      >
        <div className="mb-2 font-semibold text-white text-base">Café Felice</div>
        <div>461 Bourke St, Melbourne VIC 3000 · (03) 9000 0000</div>
        <div className="mt-1">Open 7 days — Mon–Fri 7am–4pm · Sat–Sun 8am–3pm</div>
        <div className="mt-4 text-xs opacity-50">© {new Date().getFullYear()} Café Felice. All rights reserved.</div>
      </footer>
    </main>
  );
}
