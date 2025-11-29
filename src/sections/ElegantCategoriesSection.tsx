'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GridFour } from 'phosphor-react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'phosphor-react'

const CategoriesSkeleton = () => (
  <section className="relative py-24 overflow-hidden" style={{ 
    backgroundColor: '#0d0d0d',
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px'
  }}>
    <div className="container mx-auto px-4 relative" style={{ zIndex: 10 }}>
      <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-6">
        <div className="h-5 w-56 bg-white/10 rounded-full mx-auto animate-pulse" />
        <div className="h-12 md:h-16 w-full max-w-3xl bg-white/10 rounded-lg mx-auto animate-pulse" />
        <div className="h-6 w-full max-w-2xl bg-white/5 rounded-lg mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 animate-pulse bg-white/5" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
              <div className="h-8 w-3/4 bg-white/10 rounded mb-2 animate-pulse" />
              <div className="h-5 w-1/2 bg-white/5 rounded mb-4 animate-pulse" />
              <div className="h-10 w-32 bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)
interface Category {
  id: number
  name: string
  slug: string
  description: string
  productCount: number
}
const defaultCategories = [
  { 
    name: 'Coleção Primavera', 
    slug: 'primavera', 
    description: 'Peças leves e delicadas para a estação',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'
  },
  { 
    name: 'Elegância Clássica', 
    slug: 'classica', 
    description: 'Peças atemporais para ocasiões especiais',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80'
  },
  { 
    name: 'Noite & Festa', 
    slug: 'noite-festa', 
    description: 'Brilhe em qualquer evento',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80'
  }
]

function CategoryCard({ category, index, defaultImage }: { category: Category & { image?: string }, index: number, defaultImage: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link
        href={`/produtos?categoria=${category.slug}`}
        className="block h-full category-card-link"
      >
        <div 
          className="relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg category-card-container"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 category-card-image-wrapper"
            >
              <Image
                src={(category as any).image || defaultImage}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
              />
            </div>
            <div 
              className="absolute inset-0 category-card-overlay"
            />
          </div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10 pointer-events-none">
            <h3 
              className="text-2xl md:text-3xl font-bold mb-2 pointer-events-auto category-card-title"
            >
              {category.name}
            </h3>
            <p 
              className="text-sm md:text-base mb-4 pointer-events-auto category-card-description"
            >
              {category.description}
            </p>
            <div className="pointer-events-auto">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-sand-100 rounded-lg font-semibold text-sm uppercase tracking-wide shadow-md category-card-button"
              >
                EXPLORAR
                <ArrowRight 
                  size={16} 
                  weight="bold" 
                  className="category-card-arrow"
                />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
export function ElegantCategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        
        const finalCategories = defaultCategories.map((cat, i) => ({
          id: i + 1,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          productCount: Math.floor(Math.random() * 50) + 10,
          image: cat.image
        }))
        
        setCategories(finalCategories)
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
        const finalCategories = defaultCategories.map((cat, i) => ({
          id: i + 1,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          productCount: Math.floor(Math.random() * 50) + 10,
          image: cat.image
        }))
        setCategories(finalCategories)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])
  if (loading) {
    return <CategoriesSkeleton />
  }
  return (
      <section className="relative py-24 overflow-hidden" style={{ 
        backgroundColor: '#0d0d0d',
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}>
      <div className="container mx-auto px-4 relative" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 md:mb-16 relative"
        >
          <span className="relative z-20 inline-flex items-center gap-2 justify-center text-xs uppercase tracking-[0.25em] text-primary-400 mb-4 font-semibold px-4 py-1 rounded-full border border-primary-400/50 bg-primary-500/10">
            <GridFour size={12} weight="fill" className="text-primary-400" />
            categorias em destaque
          </span>
          <h2 className="relative z-20 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-sand-100 mb-4 flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col items-center">
              <span>Explore o universo </span>
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-primary-400 via-primary-300 to-primary-400 bg-clip-text text-transparent">
                Maria Pistache
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ 
                    width: ['0%', '100%', '100%', '0%', '0%']
                  }}
                  viewport={{ once: false }}
                  transition={{ 
                    duration: 12,
                    delay: 0.8,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    times: [0, 0.08, 0.5, 0.58, 1]
                  }}
                  className="absolute bottom-2 left-0 h-3 bg-primary-400/20 -z-0"
                  style={{ transform: 'skewX(-12deg)' }}
                />
              </span>
            </div>
          </h2>
          <p className="relative z-20 text-sm sm:text-base md:text-lg lg:text-xl text-sand-200/80 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto">
            Encontre as peças perfeitas para o trabalho, fim de semana ou ocasiões especiais.
          </p>
        </motion.div>
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
            {categories.slice(0, 3).map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
                defaultImage={defaultCategories[index]?.image || defaultCategories[0].image}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
