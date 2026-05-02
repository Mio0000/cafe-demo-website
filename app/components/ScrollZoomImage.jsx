'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

/**
 * Image that scales 1.0 → 1.2 as the user scrolls through it.
 * The outer container is 150vh so the sticky image is visible for ~50vh of scroll,
 * letting the next section slide naturally over it without feeling "stuck".
 * Uses a passive scroll listener + CSS transform — no framer-motion.
 */
export default function ScrollZoomImage({ src, alt }) {
  const containerRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const image = imageRef.current
    if (!container || !image) return

    const onScroll = () => {
      const rect = container.getBoundingClientRect()
      const vh = window.innerHeight
      // progress: 0 when container-top hits viewport-top, 1 when container-bottom hits viewport-top
      const scrollable = rect.height - vh
      const progress = scrollable > 0 ? Math.max(0, Math.min(1, -rect.top / scrollable)) : 0
      const progress = Math.max(0, Math.min(1, rawProgress / 0.8));
      const scale = 1 + progress * 0.1   // 1.0 → 1.2
      image.style.transform = `scale(${scale})`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={containerRef} style={{ height: '150vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <div
          ref={imageRef}
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        >
          <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.45) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
