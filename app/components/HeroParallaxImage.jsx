'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function HeroParallaxImage({ src, alt }) {
  const imageRef = useRef(null)

  useEffect(() => {
    const el = imageRef.current
    if (!el) return

    const apply = () => {
      // Always combine scale(1.3) + translateY so the scroll handler
      // never clobbers the scale — which caused the jump on first scroll.
      el.style.transform = `scale(1.3) translateY(${window.scrollY * 0.25}px)`
    }

    apply() // set immediately so there's no flash before first scroll event
    window.addEventListener('scroll', apply, { passive: true })
    return () => window.removeEventListener('scroll', apply)
  }, [])

  return (
    <div className="absolute inset-0" style={{ overflow: 'hidden' }}>
      <div
        ref={imageRef}
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: 'center top',
          willChange: 'transform',
        }}
      >
        <Image src={src} alt={alt} fill className="object-cover opacity-50" priority />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/40 to-charcoal/80" />
    </div>
  )
}
