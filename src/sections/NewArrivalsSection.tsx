'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ArrowRight, Sparkle } from 'phosphor-react'
import { useFavorites } from '@/contexts/FavoritesContext'

const NewArrivalsSkeleton = () => (
  <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden bg-sand-100">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="text-center mb-12 md:mb-16 space-y-6">
        <div className="h-5 w-48 bg-black/20 rounded-full mx-auto animate-pulse" />
        <div className="h-12 md:h-16 w-full max-w-3xl bg-black/30 rounded-lg mx-auto animate-pulse" />
        <div className="h-6 w-full max-w-2xl bg-black/20 rounded-lg mx-auto animate-pulse" />
        <div className="h-px w-32 bg-black/10 mx-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-black/10">
            <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(to bottom right, #FDF8F2, #F5F0E8, #FDF8F2)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
              <div className="h-6 w-3/4 bg-black/40 rounded animate-pulse" />
              <div className="h-8 w-1/2 bg-black/50 rounded animate-pulse" />
              <div className="h-12 w-full bg-black/60 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export function NewArrivalsSection() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' })
  const { addFavorite, removeFavorite, isProductFavorite, getProductFavoriteId } = useFavorites()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/products?limit=4&sort=newest')
        const data = await response.json()
        if (data.success) {
          setProducts(data.data)
        }
      } catch (error) {
        console.error('Erro ao carregar novos produtos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }
  const hasProducts = products && products.length > 0
  
  if (loading) {
    return <NewArrivalsSkeleton />
  }
  
  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-24 md:py-32 overflow-hidden bg-sand-100"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.12, 0.18, 0.12],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-32 -right-10 w-[420px] h-[420px] bg-primary-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.09, 0.15, 0.09],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-[-160px] left-[-40px] w-[520px] h-[520px] bg-sage-500/10 rounded-full blur-3xl"
        />
      </div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 justify-center text-xs uppercase tracking-[0.25em] text-primary-600 mb-4 font-semibold px-4 py-1 rounded-full border border-primary-600"
          >
            <Sparkle size={12} weight="fill" className="text-primary-600" />
            novidades da semana
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-sage-900 mb-6 leading-tight"
          >
            Chegou agora:{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary-500 via-primary-700 to-primary-500 bg-clip-text text-transparent">
                peças fresquinhas
              </span>
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: '100%' } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute bottom-2 left-0 h-3 bg-[var(--logo-gold,#D4A574)]/20 -z-0"
                style={{ transform: 'skewX(-12deg)' }}
              />
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-sage-700 max-w-3xl mx-auto leading-relaxed"
          >
            As peças mais recentes da coleção, com tecidos leves, caimento fluido e aquele toque de originalidade que é só da Maria Pistache.
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: '120px' } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mx-auto mt-8 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent"
          />
        </motion.div>
        {!loading && !hasProducts ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center py-16"
          >
            <p className="text-lg md:text-xl text-sage-700">
              Nenhum produto está disponível no momento.
            </p>
          </motion.div>
        ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'visible'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -12, scale: 1.02 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="group relative"
            >
              <Link href={`/produto/${product.slug}`} className="block">
                <div className="relative h-full rounded-2xl overflow-hidden border border-cloud-200 group-hover:border-primary-500 group-hover:shadow-xl transition-all duration-500 shadow-sm">
                  <div className="relative aspect-[3/4] overflow-hidden bg-sand-100">
                    <Image
                      src={product.primary_image || (product.images && product.images[0]?.url) || 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      priority={index < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/75 via-primary-900/25 to-transparent transition-opacity duration-500" />
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const productId = product.id?.toString()
                        if (!productId) return
                        
                        if (isProductFavorite(productId)) {
                          const favoriteId = getProductFavoriteId(productId)
                          if (favoriteId) {
                            removeFavorite(favoriteId)
                          }
                        } else {
                          addFavorite(product, undefined, undefined, product.primary_image || (product.images && product.images[0]?.url))
                        }
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 shadow-lg z-10 ${
                        isProductFavorite(product.id?.toString() || '') 
                          ? 'bg-sage-50/95 backdrop-blur-md border border-red-200' 
                          : 'bg-primary-500 border border-primary-500'
                      }`}
                    >
                      <Heart 
                        size={18} 
                        className={isProductFavorite(product.id?.toString() || '') ? 'text-red-500' : 'text-white'} 
                        weight={isProductFavorite(product.id?.toString() || '') ? 'fill' : 'regular'} 
                      />
                    </motion.button>
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 space-y-2 sm:space-y-3 z-10">
                      <h3 className="font-semibold text-base sm:text-lg text-sand-100 group-hover:text-primary-500 transition-colors duration-300 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl sm:text-2xl font-bold text-sand-100">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="pt-1"
                      >
                        <div className="w-full bg-primary-500 hover:bg-primary-600 text-sand-100 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn">
                          <span>Ver detalhes</span>
                          <ArrowRight size={18} weight="bold" className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        )}
        {hasProducts && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-8 sm:mt-12 md:mt-16"
        >
          <Link href="/produtos?novidades=true">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary-500 text-sand-100 rounded-full font-semibold text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 overflow-hidden"
            >
              <motion.div
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              <span className="relative z-10">Ver Todas as Novidades</span>
              <ArrowRight size={18} weight="thin" className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </Link>
        </motion.div>
        )}
      </div>
      <div className="custom-shape-divider-bottom absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full"
          style={{ width: 'calc(100% + 1.3px)', height: '100px', transform: 'scaleY(-1)' }}
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="shape-fill"
            fill="#F5FBF7"
          />
        </svg>
      </div>
    </section>
  )
}
