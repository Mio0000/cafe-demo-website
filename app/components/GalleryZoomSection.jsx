'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const BG = '#FAF9F6'

const FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
  'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8',
  'https://images.unsplash.com/photo-1453614512568-c4024d13c247',
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0',
  'https://images.unsplash.com/photo-1525610553991-2bede1a236e2',
]

function getPhotoId(url) {
  const m = url && url.match(/photo-[\w-]+/)
  return m ? m[0] : url
}

function imgSrc(base, w, h) {
  const clean = base.split('?')[0]
  return `${clean}?w=${w}&h=${h}&q=85&auto=format&fit=crop`
}

function pickImages(heroUrl, interiorUrl) {
  const heroBase     = (heroUrl     || '').split('?')[0]
  const interiorBase = (interiorUrl || '').split('?')[0]
  const heroId     = getPhotoId(heroBase)
  const interiorId = getPhotoId(interiorBase)

  const used = new Set([heroId])
  const surrounds = []

  if (interiorId && interiorId !== heroId) {
    surrounds.push(interiorBase)
    used.add(interiorId)
  }
  for (const fb of FALLBACK_POOL) {
    if (surrounds.length >= 4) break
    const id = getPhotoId(fb)
    if (!used.has(id)) { surrounds.push(fb); used.add(id) }
  }

  return {
    center: heroBase,
    top:    surrounds[0],
    left:   surrounds[1],
    right:  surrounds[2],
    bottom: surrounds[3],
  }
}

/*
 * Layout — tight cluster, ~20px gap on all sides, no scale offset on surrounds.
 * CENTER 36vw×27vw. Surrounds ≈65% of center width, positioned for ~1.5vw gap.
 *   TOP 24vw×13.5vw  top: 50vh-28.5vw  left: 50%-12vw
 *   LEFT 20vw×26.7vw  top: 50vh-13.35vw  left: 50%-39.5vw
 *   RIGHT 18vw×27vw  top: 50vh-13.5vw  left: 50%+19.5vw
 *   BOTTOM 24vw×13.5vw  top: 50vh+15vw  left: 50%-12vw
 */
export default function GalleryZoomSection({ cafe }) {
  const sectionRef = useRef(null)
  const stickyRef  = useRef(null)
  const centerRef  = useRef(null)
  const topRef     = useRef(null)
  const leftRef    = useRef(null)
  const rightRef   = useRef(null)
  const bottomRef  = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const sticky  = stickyRef.current
    const center  = centerRef.current
    if (!section || !sticky || !center) return

    let ctx = null

    const init = () => {
      ctx?.revert()

      const sRect = sticky.getBoundingClientRect()
      const cRect = center.getBoundingClientRect()

      // Center is at exactly (50%, 50vh), so tx/ty are 0
      const relCX = cRect.left - sRect.left + cRect.width  / 2
      const relCY = cRect.top  - sRect.top  + cRect.height / 2
      const finalScale = Math.max(sRect.width / cRect.width, sRect.height / cRect.height)
      const tx = sRect.width  / 2 - relCX
      const ty = sRect.height / 2 - relCY

      // Slide distance: surrounds exit toward their respective edges
      const slideV = sRect.height * 0.32
      const slideH = sRect.width  * 0.28

      ctx = gsap.context(() => {
        gsap.set(topRef.current,    { scale: 1.0, opacity: 1, transformOrigin: 'center center' })
        gsap.set(leftRef.current,   { scale: 1.0, opacity: 1, transformOrigin: 'center center' })
        gsap.set(rightRef.current,  { scale: 1.0, opacity: 1, transformOrigin: 'center center' })
        gsap.set(bottomRef.current, { scale: 1.0, opacity: 1, transformOrigin: 'center center' })
        gsap.set(center, { scale: 1.0, opacity: 1, transformOrigin: 'center center' })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start:   'top top',
            end:     'bottom bottom',
            scrub:   2.2,
          },
        })

        // Surrounds: all exit simultaneously, same duration as center zoom — pushed out feeling
        tl.to(topRef.current,    { y: -slideV, opacity: 0, ease: 'power1.inOut', duration: 0.75 }, 0)
        tl.to(leftRef.current,   { x: -slideH, opacity: 0, ease: 'power1.inOut', duration: 0.75 }, 0)
        tl.to(rightRef.current,  { x:  slideH, opacity: 0, ease: 'power1.inOut', duration: 0.75 }, 0)
        tl.to(bottomRef.current, { y:  slideV, opacity: 0, ease: 'power1.inOut', duration: 0.75 }, 0)

        // Center: grow to fill the entire viewport — starts together with surrounds exiting
        tl.to(center, {
          scale:    finalScale,
          x:        tx,
          y:        ty,
          ease:     'power1.inOut',
          duration: 0.80,
        }, 0)

        // Info overlay fades in once center fills the screen
        tl.to(overlayRef.current, {
          opacity:  1,
          y:        0,
          ease:     'none',
          duration: 0.22,
        }, 0.82)
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

  const imgs = pickImages(cafe.heroImage, cafe.interiorImage)

  return (
    <div ref={sectionRef} style={{ height: '300vh', position: 'relative' }}>

      <div
        ref={stickyRef}
        style={{
          position:   'sticky',
          top:        0,
          height:     '100vh',
          overflow:   'hidden',
          background: BG,
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>

          <div
            ref={topRef}
            style={{
              position:    'absolute',
              top:         'calc(50vh - 28.5vw)',
              left:        'calc(50% - 12vw)',
              width:       '24vw',
              aspectRatio: '16/9',
              overflow:    'hidden',
              borderRadius: 0,
              willChange:  'opacity, transform',
            }}
          >
            <Image src={imgSrc(imgs.top, 960, 540)} alt="" fill style={{ objectFit: 'cover' }} sizes="24vw" />
          </div>

          <div
            ref={leftRef}
            style={{
              position:    'absolute',
              top:         'calc(50vh - 13.35vw)',
              left:        'calc(50% - 39.5vw)',
              width:       '20vw',
              aspectRatio: '3/4',
              overflow:    'hidden',
              borderRadius: 0,
              willChange:  'opacity, transform',
            }}
          >
            <Image src={imgSrc(imgs.left, 600, 800)} alt="" fill style={{ objectFit: 'cover' }} sizes="20vw" />
          </div>

          <div
            style={{
              position: 'absolute',
              left:     'calc(50% - 18vw)',
              top:      'calc(50vh - 13.5vw)',
            }}
          >
            <div
              ref={centerRef}
              style={{
                width:           '36vw',
                aspectRatio:     '4/3',
                overflow:        'hidden',
                borderRadius:    0,
                willChange:      'transform',
                transformOrigin: 'center center',
                boxShadow:       'none',
              }}
            >
              <Image
                src={imgSrc(imgs.center, 1000, 750)}
                alt={cafe.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width:768px) 90vw, 36vw"
                priority
              />
            </div>
          </div>

          <div
            ref={rightRef}
            style={{
              position:    'absolute',
              top:         'calc(50vh - 13.5vw)',
              left:        'calc(50% + 19.5vw)',
              width:       '18vw',
              aspectRatio: '2/3',
              overflow:    'hidden',
              borderRadius: 0,
              willChange:  'opacity, transform',
            }}
          >
            <Image src={imgSrc(imgs.right, 540, 810)} alt="" fill style={{ objectFit: 'cover' }} sizes="18vw" />
          </div>

          <div
            ref={bottomRef}
            style={{
              position:    'absolute',
              top:         'calc(50vh + 15vw)',
              left:        'calc(50% - 12vw)',
              width:       '24vw',
              aspectRatio: '16/9',
              overflow:    'hidden',
              borderRadius: 0,
              willChange:  'opacity, transform',
            }}
          >
            <Image src={imgSrc(imgs.bottom, 960, 540)} alt="" fill style={{ objectFit: 'cover' }} sizes="24vw" />
          </div>

        </div>

        {/* Info overlay — fades in after center fills the screen */}
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
