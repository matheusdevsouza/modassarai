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
    title: 'Sua Essência, Seu Estilo',
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
    <section className="relative w-full aspect-[4/5] sm:aspect-[16/8] lg:aspect-[21/9] bg-gray-100 overflow-hidden group">
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
            className="object-cover brightness-75"
            priority={true}
          />
          {/* Enhanced Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-16 container mx-auto">
            <div className="max-w-2xl text-white drop-shadow-md">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                {heroImages[currentImage].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg lg:text-xl mb-10 font-light max-w-lg leading-relaxed text-gray-100"
              >
                {heroImages[currentImage].subtitle}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href={heroImages[currentImage].link}
                  className="inline-block bg-white text-black font-semibold py-4 px-10 rounded-full hover:bg-gray-200 transition-all duration-300 text-sm tracking-wide shadow-xl transform hover:-translate-y-1"
                >
                  {heroImages[currentImage].cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 p-4 flex justify-center gap-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentImage ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'}`}
            aria-label={`Ir para banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
