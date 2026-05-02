'use client'

import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const EASE = [0.76, 0, 0.24, 1]

// Outer overlay: slides down from above the screen to cover it, then slides back up
const overlayVariants = {
  initial: { y: '-100%' },
  animate: { y: 0, transition: { duration: 0.45, ease: EASE } },
  exit:    { y: '-100%', transition: { duration: 0.45, ease: EASE } },
}

// Inner logo: counter-slides upward as the overlay descends, keeping it visually centered
const logoVariants = {
  initial: { y: '60%', opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.45, ease: EASE, delay: 0.05 } },
  exit:    { y: '60%', opacity: 0, transition: { duration: 0.25, ease: EASE } },
}

// Replace this with your own logo SVG or <img>
function Logo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '2px solid rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 22, letterSpacing: 2 }}>☕</span>
      </div>
      <span
        style={{
          fontSize: 13,
          letterSpacing: '0.25em',
          fontWeight: 500,
          opacity: 0.7,
          textTransform: 'uppercase',
        }}
      >
        Cafe
      </span>
    </div>
  )
}

export default function PageTransitionOverlay() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setIsVisible(true)
    // slide-in (450ms) + logo visible (500ms) → then exit animation kicks in
    const timer = setTimeout(() => setIsVisible(false), 950)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={pathname}
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#EFC2B3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <motion.div
            variants={logoVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Logo />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
