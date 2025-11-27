'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GridFour } from 'phosphor-react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'phosphor-react'

const CategoriesSkeleton = () => (
  <section className="py-24 bg-sand-100">
    <div className="container mx-auto px-4">
      <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-6">
        <div className="h-5 w-56 bg-black/20 rounded-full mx-auto animate-pulse" />
        <div className="h-12 md:h-16 w-full max-w-3xl bg-black/30 rounded-lg mx-auto animate-pulse" />
        <div className="h-6 w-full max-w-2xl bg-black/20 rounded-lg mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden border border-black/10">
            <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(to bottom right, #FDF8F2, #F5F0E8, #FDF8F2)' }} />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
              <div className="h-8 w-3/4 bg-black/50 rounded mb-2 animate-pulse" />
              <div className="h-5 w-1/2 bg-black/40 rounded mb-4 animate-pulse" />
              <div className="h-10 w-32 bg-black/60 rounded-lg animate-pulse" />
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
      <section className="relative py-24 bg-gradient-to-b from-primary-50 via-primary-50/95 to-primary-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.12, 0.08],
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
            opacity: [0.06, 0.1, 0.06],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-[-160px] left-[-40px] w-[520px] h-[520px] bg-sage-500/10 rounded-full blur-3xl"
        />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 8 }}>
        <motion.div
          animate={{
            y: [0, 12, -5, 0],
            rotate: [0, -15, 8, 0],
            opacity: [0.15, 0.22, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute"
          style={{
            top: '20%',
            left: '-5%',
            filter: 'blur(2px)',
            zIndex: 8,
          }}
        >
          <Image
            src="/images/pistache.png"
            alt="Pistache decorativo"
            width={120}
            height={120}
            className="object-contain"
            style={{ 
              maxWidth: '140px', 
              maxHeight: '140px',
            }}
          />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -10, 8, 0],
            rotate: [0, 18, -12, 0],
            opacity: [0.16, 0.22, 0.16],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute"
          style={{
            top: '30%',
            right: '-4%',
            filter: 'blur(1.8px)',
            zIndex: 8,
          }}
        >
          <Image
            src="/images/pistache.png"
            alt="Pistache decorativo"
            width={100}
            height={100}
            className="object-contain"
            style={{ 
              maxWidth: '120px', 
              maxHeight: '120px',
            }}
          />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 15, -8, 0],
            rotate: [0, -20, 15, 0],
            opacity: [0.15, 0.22, 0.15],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute"
          style={{
            bottom: '15%',
            right: '5%',
            filter: 'blur(2.2px)',
            zIndex: 8,
          }}
        >
          <Image
            src="/images/pistache.png"
            alt="Pistache decorativo"
            width={130}
            height={130}
            className="object-contain"
            style={{ 
              maxWidth: '150px', 
              maxHeight: '150px',
            }}
          />
        </motion.div>
      </div>
      <div className="container mx-auto px-4 relative" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 md:mb-16 relative"
        >
          <span className="relative z-20 inline-flex items-center gap-2 justify-center text-xs uppercase tracking-[0.25em] text-primary-600 mb-4 font-semibold px-4 py-1 rounded-full border border-primary-600">
            <GridFour size={12} weight="fill" className="text-primary-600" />
            categorias em destaque
          </span>
          <h2 className="relative z-20 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-sage-900 mb-4 flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, -8, 0],
                opacity: [0.18, 0.25, 0.18],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="hidden sm:block"
              style={{
                filter: 'blur(1.5px)',
                zIndex: 1,
              }}
            >
              <Image
                src="/images/pistache.png"
                alt="Pistache decorativo"
                width={120}
                height={120}
                className="object-contain"
                style={{ 
                  maxWidth: '140px', 
                  maxHeight: '140px',
                }}
              />
            </motion.div>
            <div className="flex flex-col items-center">
              <span>Explore o universo </span>
              <span className="bg-gradient-to-r from-primary-500 via-primary-700 to-primary-500 bg-clip-text text-transparent">
                Maria Pistache
              </span>
            </div>
            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, 8, 0],
                opacity: [0.18, 0.25, 0.18],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="hidden sm:block"
              style={{
                filter: 'blur(1.5px)',
                zIndex: 1,
              }}
            >
              <Image
                src="/images/pistache.png"
                alt="Pistache decorativo"
                width={90}
                height={90}
                className="object-contain"
                style={{ 
                  maxWidth: '100px', 
                  maxHeight: '100px',
                }}
              />
            </motion.div>
          </h2>
          <p className="relative z-20 text-sm sm:text-base md:text-lg lg:text-xl text-sage-700 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto">
            Encontre as peças perfeitas para o trabalho, fim de semana ou ocasiões especiais.
          </p>
        </motion.div>
        <div className="relative">
          <motion.div
            animate={{
              y: [0, -12, 8, 0],
              rotate: [0, -18, 12, 0],
              opacity: [0.15, 0.22, 0.15],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5,
            }}
            className="hidden lg:block absolute"
            style={{
              top: '30%',
              left: '-4%',
              filter: 'blur(1.8px)',
              zIndex: 8,
            }}
          >
            <Image
              src="/images/pistache.png"
              alt="Pistache decorativo"
              width={100}
              height={100}
              className="object-contain"
              style={{ 
                maxWidth: '120px', 
                maxHeight: '120px',
              }}
            />
          </motion.div>
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
