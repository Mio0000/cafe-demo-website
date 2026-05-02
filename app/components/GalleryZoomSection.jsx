'use client'

import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion'
import Image from 'next/image'

/**
 * Bento gallery grid where the center image magnetically scales to fill
 * the full viewport as the user scrolls, then an info overlay slides in.
 *
 * Desktop (≥640px) grid — 2 rows:
 *   [───────────  top  ───────────]  45%
 *   [ left ] [  ZOOM  ] [ right  ]  55%
 *
 * Mobile (<640px) grid — 3 rows:
 *   [──────  top  ──────]  45%
 *   [ left ] [ right   ]  20%
 *   [────  ZOOM CENTER ─]  35%
 *
 * Scroll timeline (scrollYProgress 0→1 over 300vh):
 *   0.00–0.15  gallery at rest
 *   0.10–0.60  center scales 1→3.5 + pulls to viewport center; sides fade+slide
 *   0.65–0.85  info overlay fades in from below
 */
export default function GalleryZoomSection({ cafe }) {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // ── Side elements ──────────────────────────────────────────────
  const sidesOpacity = useTransform(scrollYProgress, [0.15, 0.52], [1, 0])
  const topY         = useTransform(scrollYProgress, [0.15, 0.50], [0, -90])
  const leftX        = useTransform(scrollYProgress, [0.15, 0.50], [0, -110])
  const rightX       = useTransform(scrollYProgress, [0.15, 0.50], [0, 110])

  // ── Zoom center ────────────────────────────────────────────────
  const zoomScale = useTransform(scrollYProgress, [0.10, 0.60], [1, 2
  ])
  // y correction computed from grid geometry so the element's center
  // tracks toward the viewport center regardless of screen size.
  const zoomY = useMotionValue(0)

  useEffect(() => {
    let correction = 200  // pixels; updated by computeCorrection()

    const computeCorrection = () => {
      const vh  = window.innerHeight
      const mob = window.innerWidth < 640
      const pad = 12, gap = 4
      const avail = vh - 2 * pad
      // Element center Y within the sticky 100vh container:
      const cellCenterY = mob
        // rows: 45% | 20% | 35%
        ? pad + avail * 0.45 + gap + avail * 0.20 + gap + avail * 0.35 / 2
        // rows: 45% | 55%
        : pad + avail * 0.45 + gap + avail * 0.55 / 2
      correction = cellCenterY - vh / 2
    }

    computeCorrection()
    window.addEventListener('resize', computeCorrection, { passive: true })

    // Subscribe to scroll progress and set y dynamically
    const unsub = scrollYProgress.on('change', (p) => {
      const t = Math.max(0, Math.min(1, (p - 0.10) / 0.50))
      zoomY.set(-t * correction)
    })

    return () => {
      window.removeEventListener('resize', computeCorrection)
      unsub()
    }
  }, [scrollYProgress, zoomY])

  // ── Info overlay ───────────────────────────────────────────────
  const infoOpacity = useTransform(scrollYProgress, [0.65, 0.85], [0, 1])
  const infoY       = useTransform(scrollYProgress, [0.65, 0.85], [72, 0])

  return (
    <div ref={containerRef} style={{ height: '300vh', position: 'relative' }}>

      {/* Responsive grid CSS — scoped class names to avoid collisions */}
      <style>{`
        .gzs-grid {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          grid-template-rows: 45% 55%;
          gap: 4px;
          height: 100%;
          padding: 12px;
        }
        .gzs-cell   { position: relative; overflow: hidden; border-radius: 3px; }
        .gzs-top    { grid-column: 1 / -1; grid-row: 1; }
        .gzs-left   { grid-column: 1;      grid-row: 2; }
        .gzs-zoom   { grid-column: 2;      grid-row: 2; position: relative; border-radius: 3px; z-index: 10; will-change: transform; }
        .gzs-right  { grid-column: 3;      grid-row: 2; }

        @media (max-width: 639px) {
          .gzs-grid  { grid-template-columns: 1fr 1fr; grid-template-rows: 45% 20% 35%; }
          .gzs-left  { grid-column: 1; grid-row: 2; }
          .gzs-right { grid-column: 2; grid-row: 2; }
          .gzs-zoom  { grid-column: 1 / -1; grid-row: 3; }
        }
      `}</style>

      {/* ── Sticky viewport ───────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#111' }}>
        <div className="gzs-grid">

          {/* Top — full width, slides up + fades */}
          <motion.div
            className="gzs-cell gzs-top"
            style={{ opacity: sidesOpacity, y: topY }}
          >
            <Image
              src={cafe.heroImage}
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
            />
          </motion.div>

          {/* Left — slides left + fades */}
          <motion.div
            className="gzs-cell gzs-left"
            style={{ opacity: sidesOpacity, x: leftX }}
          >
            <Image
              src={cafe.interiorImage}
              alt=""
              fill
              className="object-cover object-left-bottom"
              sizes="(max-width:639px)50vw, 22vw"
            />
          </motion.div>

          {/* ZOOM CENTER — no overflow:hidden, expands to fill viewport */}
          <motion.div
            className="gzs-zoom"
            style={{ scale: zoomScale, y: zoomY, transformOrigin: 'center center' }}
          >
            <Image
              src="/geminicafe.jpg"
              alt={`${cafe.name} interior`}
              fill
              className="object-cover"
              sizes="(max-width:639px)100vw, 43vw"
            />
          </motion.div>

          {/* Right — slides right + fades */}
          <motion.div
            className="gzs-cell gzs-right"
            style={{ opacity: sidesOpacity, x: rightX }}
          >
            <Image
              src={cafe.interiorImage}
              alt=""
              fill
              className="object-cover object-right-top"
              sizes="(max-width:639px)50vw, 22vw"
            />
          </motion.div>

        </div>

        {/* ── Info overlay (z-index 20 → above zoomed image) ─── */}
        <motion.div
          style={{
            opacity:         infoOpacity,
            y:               infoY,
            position:        'absolute',
            inset:           0,
            zIndex:          20,
            display:         'flex',
            flexDirection:   'column',
            alignItems:      'center',
            justifyContent:  'flex-end',
            paddingBottom:   72,
            background:      'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, transparent 100%)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 520, padding: '0 24px' }}>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-brass mb-3">
              Find Us
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-cream mb-4">
              {cafe.name}
            </h2>
            <div style={{ width: 36, height: 1, background: '#D4AF37', margin: '0 auto 20px' }} />
            <address className="not-italic font-sans text-cream/75 text-sm leading-relaxed mb-6">
              {cafe.address?.line1}
              {cafe.address?.line2 && <><br />{cafe.address.line2}</>}
              {cafe.address?.city  && <><br />{cafe.address.city}</>}
            </address>
            {cafe.hours?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                {cafe.hours.slice(0, 3).map((h) => (
                  <div key={h.days}>
                    <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-brass/70">
                      {h.days}
                    </p>
                    <p className="font-serif text-cream/90 text-sm">{h.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
