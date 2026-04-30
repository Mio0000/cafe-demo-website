"use client";

import { useState } from "react";
import Image from "next/image";

// ─── Navigation ─────────────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#menu", label: "Menu" },
    { href: "#location", label: "Location" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-beige">
      {/* Leadlight colour strip */}
      <div className="leadlight-strip h-1 w-full" />

      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <ArchLogo />
          <span className="font-serif text-xl text-forest tracking-wide group-hover:text-brass transition-colors duration-300">
            Cathedral Coffee
          </span>
        </a>

        {/* Desktop links */}
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
            href="#contact"
            className="ml-4 px-5 py-2 border border-forest text-forest font-sans text-sm tracking-widest uppercase hover:bg-forest hover:text-cream transition-all duration-300"
          >
            Reserve
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-px bg-charcoal transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-px bg-charcoal transition-all duration-300 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-px bg-charcoal transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile drawer */}
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
            href="#contact"
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
    <svg
      width="28"
      height="34"
      viewBox="0 0 28 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 2C7.373 2 2 7.373 2 14V32H6V14C6 9.582 9.582 6 14 6C18.418 6 22 9.582 22 14V32H26V14C26 7.373 20.627 2 14 2Z"
        fill="#2D5016"
      />
      <path d="M9 20H19V32H9V20Z" fill="#D4AF37" opacity="0.6" />
      <rect x="2" y="30" width="24" height="2" fill="#2D5016" />
    </svg>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-charcoal pt-16">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/cathedralcoffee.jpg"
          alt="Cathedral Coffee interior"
          fill
          className="object-cover opacity-50"
          priority
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/40 to-charcoal/80" />
      </div>

      {/* Arch frame decoration — two tall vertical borders */}
      <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none z-10">
        {/* Left arch pillar */}
        <div className="absolute left-4 md:left-12 top-16 bottom-0 w-px bg-gradient-to-b from-brass/0 via-brass/60 to-brass/0" />
        {/* Right arch pillar */}
        <div className="absolute right-4 md:right-12 top-16 bottom-0 w-px bg-gradient-to-b from-brass/0 via-brass/60 to-brass/0" />
        {/* Top arch curve */}
        <svg
          className="absolute left-4 md:left-12 right-4 md:right-12 top-16"
          style={{ width: "calc(100% - 32px)" }}
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 12 Q50 0 100 12"
            stroke="#D4AF37"
            strokeWidth="0.4"
            strokeOpacity="0.7"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Hero content */}
      <div className="relative z-20 text-center px-6 max-w-2xl mx-auto">
        {/* Eyebrow */}
        <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-6">
          Melbourne CBD · Est. Cathedral Arcade
        </p>

        {/* H1 */}
        <h1 className="font-serif text-5xl md:text-7xl text-cream leading-tight mb-4">
          Cathedral
          <br />
          <span className="italic text-brass">Coffee</span>
        </h1>

        {/* Brass rule */}
        <div className="flex items-center justify-center gap-4 my-6">
          <div className="h-px w-12 bg-brass/60" />
          <LeadlightDiamond />
          <div className="h-px w-12 bg-brass/60" />
        </div>

        {/* Subheading */}
        <p className="font-sans text-base md:text-lg text-cream/80 font-light leading-relaxed mb-10">
          Hidden in the heart of Melbourne CBD's Cathedral Arcade.
          <br className="hidden md:block" />
          Coffee by day &mdash; wine by night.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#menu"
            className="px-8 py-3 bg-brass text-charcoal font-sans text-sm tracking-widest uppercase hover:bg-brass-light transition-colors duration-300"
          >
            View Menu
          </a>
          <a
            href="#contact"
            className="px-8 py-3 border border-cream/60 text-cream font-sans text-sm tracking-widest uppercase hover:border-brass hover:text-brass transition-colors duration-300"
          >
            Reserve
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60">
        <span className="font-sans text-xs tracking-widest uppercase text-cream/60">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-brass/80 to-transparent animate-pulse" />
      </div>
    </section>
  );
}

function LeadlightDiamond() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect
        x="6"
        y="0"
        width="8"
        height="8"
        transform="rotate(45 6 0)"
        fill="#D4AF37"
        fillOpacity="0.8"
      />
    </svg>
  );
}

// ─── Menu ────────────────────────────────────────────────────────────────────
const menuSections = [
  {
    title: "Coffee",
    icon: "☕",
    items: [
      { name: "Espresso", desc: "Single origin, bright & clean", price: "$4.5" },
      { name: "Flat White", desc: "Velvety microfoam, full-bodied", price: "$5.5" },
      { name: "Oat Latte", desc: "Creamy, naturally sweet", price: "$6.5" },
      { name: "Cold Brew", desc: "12-hour steep, smooth & dark", price: "$7" },
      { name: "Filter", desc: "Rotating single origin", price: "$5" },
      { name: "Matcha Latte", desc: "Ceremonial grade, house blend", price: "$7" },
    ],
  },
  {
    title: "Baguettes & Bites",
    icon: "🥖",
    items: [
      { name: "Jambon Beurre", desc: "Ham, cultured butter, cornichon", price: "$14" },
      { name: "Smoked Salmon", desc: "Cream cheese, capers, dill", price: "$16" },
      { name: "Brie & Fig", desc: "Brie, fig jam, walnuts, rocket", price: "$15" },
      { name: "Croque Monsieur", desc: "Gruyère, ham, béchamel", price: "$17" },
      { name: "Seasonal Tart", desc: "Ask your server today", price: "$12" },
      { name: "Croissant", desc: "Butter, almond, or plain", price: "$6" },
    ],
  },
  {
    title: "Wine & Evening",
    icon: "🍷",
    items: [
      { name: "House White", desc: "Sav Blanc, Marlborough NZ", price: "$12 / $48" },
      { name: "House Red", desc: "Shiraz, Barossa Valley SA", price: "$12 / $52" },
      { name: "Prosecco", desc: "Nino Franco, Italy", price: "$13 / $56" },
      { name: "Natural Wine", desc: "Rotating selection, ask staff", price: "From $14" },
      { name: "Aperol Spritz", desc: "Aperol, prosecco, orange", price: "$16" },
      { name: "Non-Alcoholic", desc: "Lyre's spirits, sparkling", price: "$12" },
    ],
  },
];

function Menu() {
  return (
    <section id="menu" className="py-24 bg-cream">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-3">
            What we serve
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-forest">Our Menu</h2>
          <div className="section-divider" />
          <p className="font-sans text-charcoal/60 max-w-md mx-auto leading-relaxed">
            Seasonal produce, quality roasts, and natural wines — served in a
            space that time forgot.
          </p>
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {menuSections.map((section) => (
            <div key={section.title} className="menu-card bg-white">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-beige">
                <span className="text-2xl" role="img" aria-label={section.title}>
                  {section.icon}
                </span>
                <h3 className="font-serif text-xl text-forest">{section.title}</h3>
              </div>
              <ul className="space-y-4">
                {section.items.map((item) => (
                  <li key={item.name} className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-sans text-sm font-medium text-charcoal">
                        {item.name}
                      </p>
                      <p className="font-sans text-xs text-charcoal/50 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <span className="font-sans text-sm text-brass font-medium whitespace-nowrap">
                      {item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center font-sans text-xs text-charcoal/40 mt-10 tracking-wide">
          Menu changes seasonally. Dietary options available — ask your barista.
        </p>
      </div>
    </section>
  );
}

// ─── Location ────────────────────────────────────────────────────────────────
const hours = [
  { days: "Monday – Tuesday", time: "7:30 am – 3:30 pm" },
  { days: "Wednesday – Friday", time: "7:30 am – 8:00 pm" },
  { days: "Saturday", time: "9:00 am – 8:00 pm" },
  { days: "Sunday", time: "10:00 am – 4:00 pm" },
];

function Location() {
  return (
    <section id="location" className="py-24 bg-beige">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-3">
            Find us
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-forest">Location</h2>
          <div className="section-divider" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Map */}
          <div className="relative w-full aspect-[4/3] overflow-hidden border border-brass/30 shadow-lg">
            <iframe
              title="Cathedral Coffee location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835099209799!2d144.96528!3d-37.81407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642b5c73e3b5f%3A0x4e2e8c35e8c0c0a0!2sNicholas%20Building%2C%2037%20Swanston%20St%2C%20Melbourne%20VIC%203000!5e0!3m2!1sen!2sau!4v1714000000000"
              width="100%"
              height="100%"
              style={{ border: 0, position: "absolute", inset: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Info */}
          <div className="space-y-8">
            {/* Address */}
            <div>
              <h3 className="font-serif text-xl text-forest mb-3">Address</h3>
              <div className="h-px w-8 bg-brass mb-4" />
              <address className="not-italic font-sans text-charcoal/70 leading-relaxed">
                Unit 9, 37 Swanston St
                <br />
                Cathedral Arcade, Nicholas Building
                <br />
                Melbourne VIC 3000
              </address>
              <p className="font-sans text-xs text-charcoal/50 mt-3 italic">
                Enter via Swanston St arcade entrance — look for the leadlight
                ceiling.
              </p>
            </div>

            {/* Hours */}
            <div>
              <h3 className="font-serif text-xl text-forest mb-3">Hours</h3>
              <div className="h-px w-8 bg-brass mb-4" />
              <ul className="space-y-2">
                {hours.map((h) => (
                  <li
                    key={h.days}
                    className="flex justify-between font-sans text-sm text-charcoal/70 gap-4"
                  >
                    <span>{h.days}</span>
                    <span className="text-charcoal font-medium">{h.time}</span>
                  </li>
                ))}
              </ul>
              <p className="font-sans text-xs text-charcoal/40 mt-4">
                Wine service from 4:00 pm Wed – Sat.
              </p>
            </div>

            {/* Getting there */}
            <div>
              <h3 className="font-serif text-xl text-forest mb-3">Getting Here</h3>
              <div className="h-px w-8 bg-brass mb-4" />
              <ul className="space-y-2 font-sans text-sm text-charcoal/70">
                <li>🚃 Flinders St Station — 3 min walk</li>
                <li>🚋 Tram stop 9 on Swanston St</li>
                <li>🅿️ Wilson Parking on Collins St</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────
function Contact() {
  const [status, setStatus] = useState("idle");

  function handleSubmit(e) {
    e.preventDefault();
    setStatus("sent");
  }

  return (
    <section id="contact" className="py-24 bg-forest">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-brass mb-3">
            Say hello
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-cream">
            Get in Touch
          </h2>
          <div className="w-16 h-px bg-brass mx-auto my-6" />
          <p className="font-sans text-cream/60 max-w-sm mx-auto leading-relaxed">
            Reservations, events, or just a question — we'd love to hear from
            you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact details */}
          <div className="space-y-8">
            {/* Phone */}
            <div>
              <p className="font-sans text-xs tracking-widest uppercase text-brass mb-2">
                Phone
              </p>
              <a
                href="tel:+61419399220"
                className="font-serif text-2xl text-cream hover:text-brass transition-colors duration-300"
              >
                +61 419 399 220
              </a>
            </div>

            {/* Instagram */}
            <div>
              <p className="font-sans text-xs tracking-widest uppercase text-brass mb-2">
                Instagram
              </p>
              <a
                href="https://instagram.com/ccmelbourne"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <InstagramIcon />
                <span className="font-sans text-cream/80 group-hover:text-brass transition-colors duration-300">
                  @ccmelbourne
                </span>
              </a>
            </div>

            {/* Address again */}
            <div>
              <p className="font-sans text-xs tracking-widest uppercase text-brass mb-2">
                Address
              </p>
              <address className="not-italic font-sans text-cream/70 leading-relaxed text-sm">
                Unit 9, 37 Swanston St
                <br />
                Cathedral Arcade, Nicholas Building
                <br />
                Melbourne VIC 3000
              </address>
            </div>

            {/* Interior photo snippet */}
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-brass/20">
              <Image
                src="/cathedral-coffee-2.jpg"
                alt="Cafe interior"
                fill
                className="object-cover opacity-70 hover:opacity-90 transition-opacity duration-500"
              />
            </div>
          </div>

          {/* Form */}
          <div>
            {status === "sent" ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-12 h-12 border-2 border-brass rounded-full flex items-center justify-center mb-4">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M4 10L8 14L16 6"
                      stroke="#D4AF37"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-cream mb-2">Thank you</h3>
                <p className="font-sans text-cream/60 text-sm">
                  We'll be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField
                  label="Name"
                  id="name"
                  type="text"
                  placeholder="Your name"
                  required
                />
                <FormField
                  label="Email"
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
                <FormField
                  label="Phone (optional)"
                  id="phone"
                  type="tel"
                  placeholder="+61 4xx xxx xxx"
                />
                <div>
                  <label
                    htmlFor="message"
                    className="block font-sans text-xs tracking-widest uppercase text-brass mb-2"
                  >
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
      <label
        htmlFor={id}
        className="block font-sans text-xs tracking-widest uppercase text-brass mb-2"
      >
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
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-brass"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-charcoal py-8 text-center">
      <div className="leadlight-strip h-px w-full mb-8" />
      <div className="max-w-6xl mx-auto px-6">
        <ArchLogo />
        <p className="font-serif text-lg text-cream/60 mt-3 mb-1">
          Cathedral Coffee
        </p>
        <p className="font-sans text-xs text-cream/30 tracking-wide">
          Unit 9, 37 Swanston St · Cathedral Arcade, Melbourne VIC 3000
        </p>
        <p className="font-sans text-xs text-cream/20 mt-6">
          © {new Date().getFullYear()} Cathedral Coffee. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Menu />
        <Location />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
