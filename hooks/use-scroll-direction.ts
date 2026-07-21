'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Tracks whether the page has scrolled down far enough (and in the "down"
 * direction) that UI like a sticky header should hide itself to reclaim
 * screen space. Scrolling back up - even slightly - reveals it again.
 */
export function useHideOnScrollDown(hideThreshold = 8, hideAfter = 72) {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY
    let ticking = false

    function update() {
      ticking = false
      const y = window.scrollY
      const delta = y - lastY.current

      if (y <= hideAfter) {
        setHidden(false)
      } else if (delta > hideThreshold) {
        setHidden(true)
      } else if (delta < 0) {
        // Any upward movement reveals the header right away.
        setHidden(false)
      }

      lastY.current = y
    }

    function onScroll() {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hideThreshold, hideAfter])

  return hidden
}
