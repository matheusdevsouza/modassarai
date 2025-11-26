'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
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
  const [currentImage, setCurrentImage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout>()
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
    }, 5000)
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
  const currentImageData = heroImages[currentImage]
  return (
    <section className="relative min-h-[calc(100svh-112px)] sm:min-h-[calc(100vh-112px)] overflow-hidden bg-sand-100" style={{ marginTop: '112px' }}>
      <AnimatePresence mode="sync">
        <motion.div
          key={currentImage}
          initial={{ x: '100%', opacity: 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            <Image
              src={isMobile ? currentImageData.mobileImageUrl : currentImageData.imageUrl}
              alt={currentImageData.alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/50 to-primary-900/70 mix-blend-multiply" />
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center max-w-4xl"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white/80 text-sm md:text-base uppercase tracking-[0.3em] mb-4 font-semibold"
          >
            Maria Pistache
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white mb-6 leading-tight"
          >
            Moda feminina para viver seus melhores dias.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-white/85 text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          >
            Peças leves, versáteis e contemporâneas, pensadas para acompanhar cada momento da sua rotina.
          </motion.p>
          <motion.a
            href="/produtos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-primary-500 text-white font-semibold uppercase tracking-[0.25em] transition-all duration-300 rounded-full shadow-lg hover:bg-primary-600"
          >
            VER COLEÇÕES
          </motion.a>
        </motion.div>
      </div>
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-2.5 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`slider-indicator transition-all duration-300 rounded-full ${
              index === currentImage
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
