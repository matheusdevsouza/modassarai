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
    title: 'NOVA COLEÇÃO',
    subtitle: 'Descubra as tendências da estação',
    cta: 'CONFIRA',
    link: '/produtos'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1512101903502-7eb0c9022c74?q=80&w=1887&auto=format&fit=crop',
    mobileImageUrl: 'https://images.unsplash.com/photo-1512101903502-7eb0c9022c74?q=80&w=768&auto=format&fit=crop',
    alt: 'Vestidos Elegantes',
    title: 'VESTIDOS',
    subtitle: 'Elegância para todos os momentos',
    cta: 'COMPRAR AGORA',
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
            className="object-cover"
            priority={true}
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent sm:from-black/20" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-16 container mx-auto">
            <div className="max-w-md text-white drop-shadow-md">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 uppercase leading-tight"
              >
                {heroImages[currentImage].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg mb-8 font-medium"
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
                  className="inline-block bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-black hover:text-white transition-all duration-300 text-sm tracking-wide uppercase shadow-lg"
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
