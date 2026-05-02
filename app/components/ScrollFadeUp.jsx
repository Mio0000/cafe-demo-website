'use client'

import { useEffect, useRef, useState } from 'react'

const BEZIER = 'cubic-bezier(0.33, 1, 0.68, 1)'

/**
 * Fades + slides up when the element enters the viewport.
 * Uses IntersectionObserver + CSS transitions — no framer-motion,
 * keeping the RSC server bundle clean for Next.js 14 App Router.
 */
export default function ScrollFadeUp({
  children,
  delay = 0,
  distance = 40,
  className,
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { rootMargin: '-60px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${distance}px)`,
        transition: `opacity 0.78s ${BEZIER} ${delay}s, transform 0.78s ${BEZIER} ${delay}s`,
      }}
      className={className}
    >
      {children}
    </div>
  )
}
