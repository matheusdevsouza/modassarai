'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const heroImages = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?auto=format&fit=crop&w=1920&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?auto=format&fit=crop&w=768&q=80',
    alt: 'Nova Coleção Feminina',
    title: 'Sua essência, seu estilo',
    subtitle: 'Uma curadoria exclusiva que une sofisticação e leveza para realçar sua autenticidade.',
    cta: 'Explorar Coleção',
    link: '/produtos'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1512101903502-7eb0c9022c74?q=80&w=1887&auto=format&fit=crop',
    mobileImageUrl: 'https://images.unsplash.com/photo-1512101903502-7eb0c9022c74?q=80&w=768&auto=format&fit=crop',
    alt: 'Vestidos Elegantes',
    title: 'Elegância em Movimento',
    subtitle: 'Peças fluidas e cortes impecáveis desenhados para mulheres que inspiram presença.',
    cta: 'Ver Vestidos',
    link: '/produtos?categoria=vestidos'
  }
]

export function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length)
    }, 6000)
    return () => clearInterval(autoPlayRef.current)
  }, [])

  const goToImage = (index: number) => {
    setCurrentImage(index)
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % heroImages.length)
      }, 6000)
    }
  }

  return (
    <section className="relative w-full h-[85vh] sm:h-[80vh] lg:h-[90vh] bg-gray-100 overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={isMobile ? heroImages[currentImage].mobileImageUrl : heroImages[currentImage].imageUrl}
            alt={heroImages[currentImage].alt}
            fill
            className="object-cover"
            priority={true}
          />
          {/* Subtle Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end pb-20 px-6 sm:px-12 lg:px-24">
            <div className="max-w-4xl text-white">
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl sm:text-6xl lg:text-8xl font-black mb-4 uppercase tracking-tight leading-[0.9]"
              >
                {heroImages[currentImage].title}
              </motion.h2>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg sm:text-xl lg:text-2xl mb-8 font-medium max-w-xl text-gray-100 leading-snug"
              >
                {heroImages[currentImage].subtitle}
              </motion.p>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Link
                  href={heroImages[currentImage].link}
                  className="inline-block bg-white text-black font-bold py-4 px-12 text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300"
                >
                  {heroImages[currentImage].cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-8 right-8 sm:right-12 lg:right-24 flex gap-4 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-12 h-1 transition-all duration-300 ${index === currentImage ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
              }`}
            aria-label={`Ir para banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
