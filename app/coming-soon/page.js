import Link from "next/link";

export const metadata = {
  title: "Coming Soon",
  description: "Reservations opening soon.",
};

export default function ComingSoon() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      {/* Leadlight top strip */}
      <div className="leadlight-strip fixed top-0 left-0 right-0 h-1" />

      <div className="text-center max-w-lg">
        {/* Decorative brass line */}
        <div className="w-12 h-px bg-brass mx-auto mb-10" />

        <p className="font-sans text-xs tracking-[0.3em] uppercase text-brass mb-6">
          Reservations
        </p>

        <h1 className="font-serif text-5xl md:text-7xl text-forest leading-tight mb-6">
          Coming<br />Soon
        </h1>

        <div className="w-12 h-px bg-brass mx-auto mb-8" />

        <p className="font-serif text-charcoal/70 text-lg leading-relaxed mb-10">
          We&rsquo;re putting the finishing touches on our reservation system.
          Check back soon &mdash; we can&rsquo;t wait to welcome you.
        </p>

        <Link
          href="/"
          className="inline-block px-8 py-3 border border-forest text-forest font-sans text-sm tracking-widest uppercase hover:bg-forest hover:text-cream transition-all duration-300"
        >
          Back to Home
        </Link>
      </div>

      {/* Bottom decorative strip */}
      <div className="leadlight-strip fixed bottom-0 left-0 right-0 h-1" />
    </main>
  );
}
