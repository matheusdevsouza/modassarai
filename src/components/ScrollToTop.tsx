'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const scrollToTop = () => {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto' as ScrollBehavior
        })
        
        if (document.documentElement) {
          document.documentElement.scrollTop = 0
        }
        if (document.body) {
          document.body.scrollTop = 0
        }
      } catch (e) {
        window.scrollTo(0, 0)
      }
    }

    scrollToTop()
    const timeoutId1 = setTimeout(() => {
      scrollToTop()
    }, 0)

    const timeoutId2 = setTimeout(() => {
      scrollToTop()
    }, 10)

    const timeoutId3 = setTimeout(() => {
      scrollToTop()
    }, 100)

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
      clearTimeout(timeoutId3)
    }
  }, [pathname])

  return null
}

