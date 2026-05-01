"use client";

import { useState } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCafe } from "../../lib/cafes.js";

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav({ cafe }) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#menu", label: "Menu" },
    { href: "#location", label: "Location" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-beige">
      <div className="leadlight-strip h-1 w-full" />
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <ArchLogo />
          <span className="font-serif text-xl text-forest tracking-wide group-hover:text-brass transition-colors duration-300">
            {cafe.name}
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-sans text-sm tracking-widest uppercase text-charcoal hover:text-brass transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/coming-soon"
            className="ml-4 px-5 py-2 border border-forest text-forest font-sans text-sm tracking-widest uppercase hover:bg-forest hover:text-cream transition-all duration-300"
          >
            Reserve
          </a>
        </nav>
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-px bg-charcoal transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-px bg-charcoal transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-px bg-charcoal transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-cream border-t border-beige px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-sans text-sm tracking-widest uppercase text-charcoal hover:text-brass transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/coming-soon"
            onClick={() => setOpen(false)}
            className="self-start px-5 py-2 border border-forest text-forest font-sans text-sm tracking-widest uppercase hover:bg-forest hover:text-cream transition-all duration-300"
          >
            Reserve
          </a>
        </div>
      )}
    </header>
  );
}

function ArchLogo() {
  return (
    <svg width="28" height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2C7.373 2 2 7.373 2 14V32H6V14C6 9.582 9.582 6 14 6C18.418 6 22 9.582 22 14V32H26V14C26 7.373 20.627 2 14 2Z" fill="#2D5016" />
      <path d="M9 20H19V32H9V20Z" fill="#D4AF37" opacity="0.6" />
      <rect x="2" y="30" width="24" height="2" fill="#2D5016" />
    </svg>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero({ cafe }) {
  const parts = cafe.name.split(" ");
  const first = parts.slice(0, -1).join(" ");
  const last = parts[parts.length - 1];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-charcoal pt-16">
      <div className="absolute inset-0">
        <Image
          src={cafe.heroImage}
          alt={`${cafe.name} interior`}
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/40 to-charcoal/80" />
      </div>

      {/* Arch frame */}
      <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none z-10">
        <div className="absolute left-4 md:left-12 top-16 bottom-0 w-px bg-gradient-to-b from-brass/0 via-brass/60 to-brass/0" />
        <div className="absolute right-4 md:right-12 top-16 bottom-0 w-px bg-gradient-to-b from-brass/0 via-brass/60 to-brass/0" />
        <svg
          className="absolute left-4 md:left-12 top-16"
          style={{ width: "calc(100% - 32px)" }}
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          fill="none"
        >
          <path d="M0 12 Q50 0 100 12" stroke="#D4AF37" strokeWidth="0.4" strokeOpacity="0.7" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className="relative z-20 text-center px-6 max-w-2xl mx-auto">
        <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-6">
          {cafe.eyebrow}
        </p>
        <h1 className="font-serif text-5xl md:text-7xl text-cream leading-tight mb-4">
          {first ? (
            <>
              {first}
              <br />
              <span className="italic text-brass">{last}</span>
            </>
          ) : (
            <span className="italic text-brass">{last}</span>
          )}
        </h1>
        <div className="flex items-center justify-center gap-4 my-6">
          <div className="h-px w-12 bg-brass/60" />
          <LeadlightDiamond />
          <div className="h-px w-12 bg-brass/60" />
        </div>
        <p className="font-sans text-base md:text-lg text-cream/80 font-light leading-relaxed mb-10">
          {cafe.tagline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#menu"
            className="px-8 py-3 bg-brass text-charcoal font-sans text-sm tracking-widest uppercase hover:bg-brass-light transition-colors duration-300"
          >
            View Menu
          </a>
          <a
            href="/coming-soon"
            className="px-8 py-3 border border-cream/60 text-cream font-sans text-sm tracking-widest uppercase hover:border-brass hover:text-brass transition-colors duration-300"
          >
            Reserve
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60">
        <span className="font-sans text-xs tracking-widest uppercase text-cream/60">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-brass/80 to-transparent animate-pulse" />
      </div>
    </section>
  );
}

function LeadlightDiamond() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="6" y="0" width="8" height="8" transform="rotate(45 6 0)" fill="#D4AF37" fillOpacity="0.8" />
    </svg>
  );
}

// ─── Menu ────────────────────────────────────────────────────────────────────
function Menu({ cafe }) {
  return (
    <section id="menu" className="py-24 bg-cream">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-3">What we serve</p>
          <h2 className="font-serif text-4xl md:text-5xl text-forest">Our Menu</h2>
          <div className="section-divider" />
          <p className="font-sans text-charcoal/60 max-w-md mx-auto leading-relaxed">{cafe.menuSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cafe.menu.map((section) => (
            <div key={section.title} className="menu-card bg-white">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-beige">
                <span className="text-2xl" role="img" aria-label={section.title}>{section.icon}</span>
                <h3 className="font-serif text-xl text-forest">{section.title}</h3>
              </div>
              <ul className="space-y-4">
                {section.items.map((item) => (
                  <li key={item.name} className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-sans text-sm font-medium text-charcoal">{item.name}</p>
                      <p className="font-sans text-xs text-charcoal/50 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="font-sans text-sm text-brass font-medium whitespace-nowrap">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {cafe.menuNote && (
          <p className="text-center font-sans text-xs text-charcoal/40 mt-10 tracking-wide">{cafe.menuNote}</p>
        )}
      </div>
    </section>
  );
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
function Reviews({ cafe }) {
  if (!cafe.reviews?.length) return null;

  return (
    <section className="py-24 bg-charcoal">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-3">What guests say</p>
          <h2 className="font-serif text-4xl md:text-5xl text-cream">Reviews</h2>
          <div className="w-16 h-px bg-brass mx-auto my-6" />
          <div className="flex items-center justify-center gap-2">
            <span className="font-serif text-3xl text-brass">{cafe.rating}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} filled={i <= Math.round(cafe.rating)} size={16} />
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cafe.reviews.map((review, i) => (
            <div key={i} className="border border-brass/20 p-6">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <StarIcon key={j} filled={j <= review.rating} size={12} />
                ))}
              </div>
              <p className="font-sans text-sm text-cream/70 leading-relaxed mb-4 italic">
                &ldquo;{review.text}&rdquo;
              </p>
              <p className="font-sans text-xs text-brass tracking-wide">— {review.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StarIcon({ filled, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={filled ? "#D4AF37" : "none"} stroke="#D4AF37" strokeWidth="1">
      <polygon points="8,1 10,6 15,6 11,9 13,14 8,11 3,14 5,9 1,6 6,6" />
    </svg>
  );
}

// ─── Location ────────────────────────────────────────────────────────────────
function Location({ cafe }) {
  return (
    <section id="location" className="py-24 bg-beige">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-3">Find us</p>
          <h2 className="font-serif text-4xl md:text-5xl text-forest">Location</h2>
          <div className="section-divider" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative w-full aspect-[4/3] overflow-hidden border border-brass/30 shadow-lg">
            <iframe
              title={`${cafe.name} location`}
              src={cafe.mapEmbed}
              width="100%"
              height="100%"
              style={{ border: 0, position: "absolute", inset: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-xl text-forest mb-3">Address</h3>
              <div className="h-px w-8 bg-brass mb-4" />
              <address className="not-italic font-sans text-charcoal/70 leading-relaxed">
                {cafe.address.line1}<br />
                {cafe.address.line2}<br />
                {cafe.address.city}
              </address>
              {cafe.address.hint && (
                <p className="font-sans text-xs text-charcoal/50 mt-3 italic">{cafe.address.hint}</p>
              )}
            </div>
            <div>
              <h3 className="font-serif text-xl text-forest mb-3">Hours</h3>
              <div className="h-px w-8 bg-brass mb-4" />
              <ul className="space-y-2">
                {cafe.hours.map((h) => (
                  <li key={h.days} className="flex justify-between font-sans text-sm text-charcoal/70 gap-4">
                    <span>{h.days}</span>
                    <span className="text-charcoal font-medium">{h.time}</span>
                  </li>
                ))}
              </ul>
              {cafe.wineNote && (
                <p className="font-sans text-xs text-charcoal/40 mt-4">{cafe.wineNote}</p>
              )}
            </div>
            {cafe.transport?.length > 0 && (
              <div>
                <h3 className="font-serif text-xl text-forest mb-3">Getting Here</h3>
                <div className="h-px w-8 bg-brass mb-4" />
                <ul className="space-y-2 font-sans text-sm text-charcoal/70">
                  {cafe.transport.map((t, i) => (
                    <li key={i}>{t.icon} {t.text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────
function Contact({ cafe }) {
  const [status, setStatus] = useState("idle");

  return (
    <section id="contact" className="py-24 bg-forest">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-3">Say hello</p>
          <h2 className="font-serif text-4xl md:text-5xl text-cream">Get in Touch</h2>
          <div className="w-16 h-px bg-brass mx-auto my-6" />
          <p className="font-sans text-cream/60 max-w-sm mx-auto leading-relaxed">
            Reservations, events, or just a question — we&apos;d love to hear from you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <p className="font-sans text-xs tracking-widest uppercase text-brass mb-2">Phone</p>
              <a
                href={`tel:${cafe.phone.replace(/\s/g, "")}`}
                className="font-serif text-2xl text-cream hover:text-brass transition-colors duration-300"
              >
                {cafe.phone}
              </a>
            </div>
            {cafe.instagram && (
              <div>
                <p className="font-sans text-xs tracking-widest uppercase text-brass mb-2">Instagram</p>
                <a
                  href={cafe.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <InstagramIcon />
                  <span className="font-sans text-cream/80 group-hover:text-brass transition-colors duration-300">
                    {cafe.instagram.handle}
                  </span>
                </a>
              </div>
            )}
            <div>
              <p className="font-sans text-xs tracking-widest uppercase text-brass mb-2">Address</p>
              <address className="not-italic font-sans text-cream/70 leading-relaxed text-sm">
                {cafe.address.line1}<br />
                {cafe.address.line2}<br />
                {cafe.address.city}
              </address>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-brass/20">
              <Image
                src={cafe.interiorImage}
                alt={`${cafe.name} interior`}
                fill
                className="object-cover opacity-70 hover:opacity-90 transition-opacity duration-500"
              />
            </div>
          </div>
          <div>
            {status === "sent" ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-12 h-12 border-2 border-brass rounded-full flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10L8 14L16 6" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-cream mb-2">Thank you</h3>
                <p className="font-sans text-cream/60 text-sm">We&apos;ll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setStatus("sent"); }} className="space-y-5">
                <FormField label="Name" id="name" type="text" placeholder="Your name" required />
                <FormField label="Email" id="email" type="email" placeholder="your@email.com" required />
                <FormField label="Phone (optional)" id="phone" type="tel" placeholder="+61 4xx xxx xxx" />
                <div>
                  <label htmlFor="message" className="block font-sans text-xs tracking-widest uppercase text-brass mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Reservation request, event enquiry..."
                    className="w-full bg-forest-dark/50 border border-cream/10 text-cream/80 font-sans text-sm px-4 py-3 placeholder:text-cream/30 focus:outline-none focus:border-brass transition-colors duration-300 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-brass text-charcoal font-sans text-sm tracking-widest uppercase hover:bg-brass-light transition-colors duration-300"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FormField({ label, id, type, placeholder, required }) {
  return (
    <div>
      <label htmlFor={id} className="block font-sans text-xs tracking-widest uppercase text-brass mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full bg-forest-dark/50 border border-cream/10 text-cream/80 font-sans text-sm px-4 py-3 placeholder:text-cream/30 focus:outline-none focus:border-brass transition-colors duration-300"
      />
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brass">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer({ cafe }) {
  return (
    <footer className="bg-charcoal py-8 text-center">
      <div className="leadlight-strip h-px w-full mb-8" />
      <div className="max-w-6xl mx-auto px-6">
        <ArchLogo />
        <p className="font-serif text-lg text-cream/60 mt-3 mb-1">{cafe.name}</p>
        <p className="font-sans text-xs text-cream/30 tracking-wide">
          {cafe.address.line1} · {cafe.address.line2}, {cafe.address.city}
        </p>
        <p className="font-sans text-xs text-cream/20 mt-6">
          © {new Date().getFullYear()} {cafe.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CafePage({ params }) {
  const cafe = getCafe(params.cafeSlug);
  if (!cafe) return notFound();

  return (
    <>
      <Nav cafe={cafe} />
      <main>
        <Hero cafe={cafe} />
        <Menu cafe={cafe} />
        <Reviews cafe={cafe} />
        <Location cafe={cafe} />
        <Contact cafe={cafe} />
      </main>
      <Footer cafe={cafe} />
    </>
  );
}
