'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useGSAP } from '@/hooks/useGSAP'
import { Star, ArrowRight } from 'phosphor-react'
import gsap from 'gsap'
interface Testimonial {
  id: number
  name: string
  location: string
  comment: string
  rating: number
  image: string | null
  created_at: string
  updated_at: string
}
const TestimonialSkeleton = () => (
  <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 max-w-lg mx-auto">
    <div className="mb-6 space-y-3">
      <div className="h-4 bg-dark-800 rounded-md"></div>
      <div className="h-4 bg-dark-800 rounded-md w-4/5"></div>
      <div className="h-4 bg-dark-800 rounded-md w-3/5"></div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-dark-800"></div>
        <div>
          <div className="h-4 w-24 bg-dark-800 rounded-md mb-1"></div>
          <div className="h-3 w-20 bg-dark-800 rounded-md"></div>
        </div>
      </div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-dark-800 rounded-sm"></div>
        ))}
      </div>
    </div>
  </div>
)
export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const { scrollAnimation } = useGSAP()
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/testimonials')
        const data = await response.json()
        if (data.success) {
          setTestimonials(data.data)
        }
      } catch (error) {
        console.error('Erro ao buscar depoimentos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [])
  useEffect(() => {
    const slider = sliderRef.current
    const slides = slider?.children
    if (!slider || !slides || loading) return
    gsap.set(slides, {
      opacity: 0,
      scale: 0.8,
      y: 50
    })
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center+=100",
        once: true
      }
    })
    tl.to(slides, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "back.out(1.2)"
    })
    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill()
      }
    }
  }, [loading])
  const getTestimonialPages = () => {
    const pages = []
    const itemsPerPage = isMobile ? 1 : 1 
    for (let i = 0; i < testimonials.length; i += itemsPerPage) {
      const page = testimonials.slice(i, i + itemsPerPage)
      pages.push(page)
    }
    return pages
  }
  const testimonialPages = getTestimonialPages()
  const totalPages = testimonialPages.length
  useEffect(() => {
    setCurrentIndex(0)
    if (sliderRef.current) {
      gsap.set(sliderRef.current, { x: 0 })
    }
  }, [isMobile])
  const goToNextSlide = useCallback(() => {
    if (sliderRef.current && totalPages > 1) {
      const nextIndex = (currentIndex + 1) % totalPages
      setCurrentIndex(nextIndex)
      const transformX = -nextIndex * (100 / totalPages)
      gsap.to(sliderRef.current, {
        x: `${transformX}%`,
        duration: 0.8,
        ease: "power2.out"
      })
    }
  }, [currentIndex, totalPages]);
  useEffect(() => {
    if (totalPages <= 1 || isPaused) return
    const interval = setInterval(() => {
      goToNextSlide()
    }, 5000) 
    return () => clearInterval(interval)
  }, [currentIndex, totalPages, isPaused, goToNextSlide])
  if (loading) {
    return (
      <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-sand-100 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 text-sage-900">
              <span>O que nossas </span>
              <span className="text-primary-600">clientes contam</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-sage-700 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-4">
              Depoimentos reais de quem já viveu a experiência Maria Pistache.
            </p>
          </motion.div>
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex gap-6 pb-8 justify-center">
                <TestimonialSkeleton />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
  if (!testimonials.length) {
    return (
      <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-sand-100 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 text-sage-900">
              <span>O que nossas </span>
              <span className="text-primary-600">clientes contam</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-sage-700 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-4">
              Assim que os primeiros depoimentos forem enviados, eles aparecerão aqui.
            </p>
          </motion.div>
          <div className="text-center text-sage-600 px-4">
            <p className="text-sm sm:text-base">Nenhum depoimento encontrado no momento.</p>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-sand-100 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-block text-sm uppercase tracking-[0.25em] text-primary-600 mb-4 font-semibold"
          >
            depoimentos
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-sage-900"
          >
            O que nossas{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary-500 via-primary-700 to-primary-500 bg-clip-text text-transparent">
                clientes contam
              </span>
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-sage-700 max-w-3xl mx-auto leading-relaxed"
          >
            Veja os depoimentos de quem já comprou conosco
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '120px' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mx-auto mt-8 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent"
          />
        </motion.div>
        <div className="relative">
          <div 
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={sliderRef}
              className="flex"
              style={{
                width: `${totalPages * 100}%`,
                willChange: 'transform',
                transform: 'translate3d(0, 0, 0)'
              }}
            >
              {testimonialPages.map((page, pageIndex) => (
                <div
                  key={pageIndex}
                  className="w-full flex-shrink-0"
                  style={{ width: `${100 / totalPages}%` }}
                >
                  <div className="flex gap-6 sm:gap-8 pb-8 justify-center px-4 sm:px-6 md:px-0">
                    {page.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-cloud-100 w-full max-w-lg mx-auto shadow-sm flex-shrink-0"
                      >
                        <div className="mb-6">
                          <p className="text-sage-800 text-sm sm:text-base leading-relaxed">
                            &quot;{testimonial.comment}&quot;
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                              <span className="text-sand-100 font-bold text-lg">
                                {testimonial.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sage-900 font-semibold text-sm sm:text-base">
                                {testimonial.name}
                              </h4>
                              <p className="text-sage-600 text-xs sm:text-sm">
                                {testimonial.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                weight={i < testimonial.rating ? "fill" : "regular"}
                                className={i < testimonial.rating ? "text-primary-500" : "text-cloud-400"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    if (sliderRef.current) {
                      const transformX = -index * (100 / totalPages)
                      gsap.to(sliderRef.current, {
                        x: `${transformX}%`,
                        duration: 0.8,
                        ease: "power2.out"
                      })
                    }
                  }}
                  className={`slider-dot h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-primary-500 w-5 sm:w-8'
                      : 'bg-cloud-300 hover:bg-cloud-400 w-1.5 sm:w-2'
                  }`}
                  aria-label={`Ir para depoimento ${index + 1}`}
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
                <Link href="/contato">
              <motion.button
                whileHover={{ 
                  scale: 1.02, 
                  y: -1,
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ 
                  duration: 0.35, 
                  ease: [0.25, 0.46, 0.45, 0.94] 
                }}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary-500 text-sand-100 rounded-xl font-semibold text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary-500/25 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    opacity: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
                    x: { duration: 2, repeat: Infinity, ease: 'linear' }
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-opacity duration-500"
                />
                <motion.span 
                  className="relative z-10"
                  initial={{ x: 0 }}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  Deixe sua Avaliação
                </motion.span>
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative z-10"
                >
                  <ArrowRight size={18} weight="thin" />
                </motion.div>
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
