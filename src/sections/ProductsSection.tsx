'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'phosphor-react'
import { formatPrice } from '@/lib/utils'
import { useGSAP } from '@/hooks/useGSAP'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import Image from 'next/image'

export function ProductsSection() {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollAnimation } = useGSAP()

  useEffect(() => {
    if (sectionRef.current) {
      scrollAnimation(sectionRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1
      })
    }
  }, [scrollAnimation])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await fetch('/api/products?limit=8&featured=true')
        const productsData = await productsResponse.json()
        if (productsData.success) {
          setProducts(productsData.data)
        }
      } catch (error) {
        console.error('Failed to fetch products', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filters = [
    { id: 'todos', label: 'Todos', count: products.length }
  ]

  const filteredProducts = products

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100)
  }

  return (
    <section ref={sectionRef} className="py-24 bg-[#0D0D0D]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-[#261E10] rounded-lg px-6 py-2 mb-8"
          >
            <span className="text-sm font-medium text-gray-300">
              Destaques da Coleção
            </span>
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-semibold mb-6 text-white"
          >
            Peças Exclusivas
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Tecidos finos, caimento perfeito e alta sofisticação.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeFilter === filter.id
                  ? 'bg-[var(--logo-gold,#D4AF37)] text-[#0D0D0D] shadow-md'
                  : 'bg-[#261E10] text-gray-300 hover:bg-[#261E10]/80 hover:text-[var(--logo-gold,#D4AF37)]'
                }`}
            >
              {filter.label}
              <span className="ml-2 text-xs opacity-75">({filter.count})</span>
            </motion.button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-sm h-32 w-32 border-b border-[#F2C063]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold text-white mb-4">Nenhum produto encontrado</h3>
            <p className="text-gray-400 font-light">Tente selecionar outro filtro ou volte mais tarde.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => {
                const discount = product.originalPrice
                  ? calculateDiscount(product.originalPrice, product.price)
                  : 0
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="group relative bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg overflow-hidden"
                  >
                    <Link href={`/produto/${product.slug}`} className="block">
                      <div className="relative aspect-[2/3] overflow-hidden bg-[#261E10] shadow-md hover:shadow-xl transition-shadow duration-300">
                        <Image
                          src={product.primary_image || (product.images && product.images[0]?.url) || 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80'}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-90"
                        />
                        <div className="absolute inset-0 bg-[#0D0D0D]/60 group-hover:bg-[#0D0D0D]/40 transition-all duration-500" />
                        <div className="absolute inset-0 flex flex-col justify-end p-8">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 + 0.3 }}
                          >
                            <h3 className="text-2xl font-semibold text-white mb-2">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-center gap-3 mb-4">
                              <span className="text-xl font-semibold text-[var(--logo-gold,#D4AF37)]">
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice && parseFloat(product.originalPrice.toString()) > parseFloat(product.price.toString()) && (
                                <span className="text-sm text-gray-500 line-through font-light">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--logo-gold,#D4AF37)] text-[#0D0D0D] rounded-lg group-hover:gap-3 transition-all duration-300">
                              <span className="text-sm font-semibold">
                                Ver Detalhes
                              </span>
                              <ArrowRight size={16} weight="bold" />
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        )}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <motion.a
            href="/produtos"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-[var(--logo-gold,#D4AF37)] text-[#0D0D0D] px-10 py-4 rounded-lg font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Ver Todos os Produtos
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}