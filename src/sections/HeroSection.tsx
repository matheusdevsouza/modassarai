'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const HeroSkeleton = () => (
  <section className="relative min-h-[calc(100svh-112px)] sm:min-h-[calc(100vh-112px)] overflow-hidden bg-sand-100" style={{ marginTop: '112px' }}>
    <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(to bottom right, #FDF8F2, #F5F0E8, #FDF8F2)' }} />
    <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
      <div className="text-center max-w-4xl w-full space-y-6">
        <div className="h-4 w-48 bg-black/20 rounded-full mx-auto animate-pulse" />
        <div className="h-16 md:h-20 w-full max-w-3xl bg-black/30 rounded-lg mx-auto animate-pulse" />
        <div className="h-6 md:h-8 w-full max-w-2xl bg-black/20 rounded-lg mx-auto animate-pulse" />
        <div className="h-12 w-64 bg-black/40 rounded-full mx-auto animate-pulse" />
      </div>
    </div>
    <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-2.5 z-10">
      <div className="w-6 sm:w-8 h-1.5 sm:h-1.5 bg-black/30 rounded-full animate-pulse" />
      <div className="w-5 sm:w-6 h-1.5 sm:h-1.5 bg-black/20 rounded-full animate-pulse" />
    </div>
  </section>
)

const heroImages = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?auto=format&fit=crop&w=1920&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?auto=format&fit=crop&w=768&q=80',
    alt: 'Modelo usando look casual feminino em tons naturais dentro de um closet'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1512101903502-7eb0c9022c74?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    mobileImageUrl: 'https://images.unsplash.com/photo-1512101903502-7eb0c9022c74?q=80&w=768&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Modelo de costas usando vestido feminino elegante em ambiente interno'
  }
]
export function HeroSection() {
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout>()
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length)
    }, 10000)
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [])
  const goToImage = (index: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentImage(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  if (loading) {
    return <HeroSkeleton />
  }

  return (
    <section className="relative min-h-[calc(100svh-112px)] sm:min-h-[calc(100vh-112px)] overflow-hidden bg-sand-100" style={{ marginTop: '112px' }}>
      <div className="absolute inset-0">
        {heroImages.map((image, index) => {
          const isActive = index === currentImage
          return (
            <motion.div
              key={image.id}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 1 : 0,
              }}
              transition={{
                duration: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute inset-0"
              style={{ pointerEvents: isActive ? 'auto' : 'none' }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={isMobile ? image.mobileImageUrl : image.imageUrl}
                  alt={image.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/65 to-black/80" />
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
        <div className="text-center max-w-4xl">
          <p className="text-white/80 text-sm md:text-base uppercase tracking-[0.3em] mb-4 font-semibold">
            Modas Saraí
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white mb-6 leading-tight">
            Moda feminina para viver seus melhores dias.
          </h1>
          <p className="text-white/70 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Peças leves, versáteis e contemporâneas, pensadas para acompanhar cada momento da sua rotina.
          </p>
          <motion.a
            href="/produtos"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-primary-500 text-white font-semibold tracking-wide transition-all duration-300 rounded-full shadow-lg hover:bg-primary-600"
          >
            Ver Coleções
          </motion.a>
        </div>
      </div>
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-2.5 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`slider-indicator transition-all duration-300 rounded-full ${index === currentImage
              ? 'w-6 sm:w-8 h-1.5 sm:h-1.5 bg-primary-500 shadow-lg'
              : 'w-5 sm:w-6 h-1.5 sm:h-1.5 bg-white/80 hover:bg-white'
              }`}
            aria-label={`Ir para slide ${index + 1}`}
            style={{ minHeight: 'auto', minWidth: 'auto' }}
          />
        ))}
      </div>
    </section>
  )
}
