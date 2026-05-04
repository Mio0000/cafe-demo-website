'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll-linked image zoom section.
 *
 * 3-row bento grid:
 *   [────────────  top  ────────────]   30%
 *   [ left ] [  ZOOM CENTER ] [right]   45%
 *   [  bottomLeft  ] [ bottomRight ]    25%
 *
 * The center image scales to fill the sticky 100vh container (= viewport)
 * as the user scrolls through 300vh. Surrounding images fade out with stagger.
 * A location overlay fades in at the end.
 *
 * Implementation: CSS `position:sticky` handles pinning;
 * GSAP ScrollTrigger with `scrub` drives the animation.
 */

function cropUrl(url, w, h, face = '') {
  const base = url.split('?')[0]
  const faceParam = face ? `&crop=${face}` : ''
  return `${base}?w=${w}&h=${h}&q=80&auto=format&fit=crop${faceParam}`
}

export default function GalleryZoomSection({ cafe }) {
  const sectionRef    = useRef(null)
  const stickyRef     = useRef(null)
  const centerRef     = useRef(null)
  const topRef        = useRef(null)
  const leftRef       = useRef(null)
  const rightRef      = useRef(null)
  const bottomLeftRef = useRef(null)
  const bottomRightRef= useRef(null)
  const overlayRef    = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const sticky  = stickyRef.current
    const center  = centerRef.current
    if (!section || !sticky || !center) return

    let ctx = null

    const init = () => {
      ctx?.revert()

      // ── Measure positions (relative values are scroll-position independent) ──
      const sRect = sticky.getBoundingClientRect()
      const cRect = center.getBoundingClientRect()

      // Center of center-cell relative to sticky container
      const relCX = cRect.left - sRect.left + cRect.width  / 2
      const relCY = cRect.top  - sRect.top  + cRect.height / 2

      // Scale needed to fill the sticky container (cover)
      const finalScale = Math.max(sRect.width / cRect.width, sRect.height / cRect.height)

      // Translation to bring center-cell's center to sticky container's center
      const tx = sRect.width  / 2 - relCX
      const ty = sRect.height / 2 - relCY

      const surrounding = [
        topRef.current,
        leftRef.current,
        rightRef.current,
        bottomLeftRef.current,
        bottomRightRef.current,
      ].filter(Boolean)

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start:   'top top',
            end:     'bottom bottom',
            scrub:   1.5,
          },
        })

        // 0→0.6: surrounding elements fade out and retract
        tl.to(surrounding, {
          opacity: 0,
          scale:   0.9,
          ease:    'none',
          stagger: { amount: 0.2, from: 'edges' },
        }, 0)

        // 0→0.6: center zooms to fill viewport
        tl.to(center, {
          scale:        finalScale,
          x:            tx,
          y:            ty,
          borderRadius: '0px',
          ease:         'none',
          duration:     0.6,
        }, 0)

        // 0.65→1: overlay fades in
        tl.to(overlayRef.current, {
          opacity:  1,
          y:        0,
          ease:     'none',
          duration: 0.35,
        }, 0.65)
      })
    }

    const rafId = requestAnimationFrame(init)
    const ro = new ResizeObserver(() => {
      ScrollTrigger.getAll().forEach(t => t.kill())
      requestAnimationFrame(init)
    })
    ro.observe(sticky)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      ctx?.revert()
    }
  }, [])

  const hero     = cafe.heroImage
  const interior = cafe.interiorImage

  return (
    // 300vh scroll container — CSS sticky handles the pin
    <div ref={sectionRef} style={{ height: '300vh', position: 'relative' }}>

      {/* Sticky viewport */}
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top:      0,
          height:   '100vh',
          overflow: 'hidden',
          background: '#111',
        }}
      >
        {/* ── Bento grid ────────────────────────────────────────── */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          gridTemplateRows:    '30% 45% 25%',
          gap:                 '3px',
          padding:             '3px',
          height:              '100%',
        }}>

          {/* Top — full width */}
          <div
            ref={topRef}
            style={{ gridColumn: '1 / -1', gridRow: '1', position: 'relative', overflow: 'hidden', borderRadius: '2px' }}
          >
            <Image src={cropUrl(hero, 1400, 420)} alt="" fill className="object-cover" sizes="100vw" />
          </div>

          {/* Left */}
          <div
            ref={leftRef}
            style={{ gridColumn: '1', gridRow: '2', position: 'relative', overflow: 'hidden', borderRadius: '2px' }}
          >
            <Image src={cropUrl(interior, 600, 700)} alt="" fill className="object-cover object-left" sizes="22vw" />
          </div>

          {/* ★ ZOOM CENTER */}
          <div
            ref={centerRef}
            style={{
              gridColumn:      '2',
              gridRow:         '2',
              position:        'relative',
              overflow:        'hidden',
              borderRadius:    '2px',
              willChange:      'transform',
              transformOrigin: 'center center',
            }}
          >
            <Image
              src={cropUrl(hero, 1000, 700)}
              alt={`${cafe.name}`}
              fill
              className="object-cover"
              sizes="(max-width:768px)100vw, 44vw"
              priority
            />
          </div>

          {/* Right */}
          <div
            ref={rightRef}
            style={{ gridColumn: '3', gridRow: '2', position: 'relative', overflow: 'hidden', borderRadius: '2px' }}
          >
            <Image src={cropUrl(interior, 600, 700, 'right')} alt="" fill className="object-cover object-right" sizes="22vw" />
          </div>

          {/* Bottom left */}
          <div
            ref={bottomLeftRef}
            style={{ gridColumn: '1 / 3', gridRow: '3', position: 'relative', overflow: 'hidden', borderRadius: '2px' }}
          >
            <Image src={cropUrl(hero, 900, 400, 'bottom')} alt="" fill className="object-cover object-bottom" sizes="66vw" />
          </div>

          {/* Bottom right */}
          <div
            ref={bottomRightRef}
            style={{ gridColumn: '3', gridRow: '3', position: 'relative', overflow: 'hidden', borderRadius: '2px' }}
          >
            <Image src={cropUrl(interior, 600, 400, 'bottom')} alt="" fill className="object-cover" sizes="22vw" />
          </div>

        </div>

        {/* ── Info overlay (fades in after zoom completes) ──────── */}
        <div
          ref={overlayRef}
          style={{
            position:       'absolute',
            inset:          0,
            zIndex:         20,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'flex-end',
            paddingBottom:  72,
            background:     'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, transparent 100%)',
            opacity:        0,
            transform:      'translateY(48px)',
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
                    <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-brass/70">{h.days}</p>
                    <p className="font-serif text-cream/90 text-sm">{h.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
