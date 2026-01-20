'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'phosphor-react'
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'

export function NewArrivalsSection() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const hasProducts = products && products.length > 0

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-black uppercase tracking-wider mb-2">
            Novidades
          </h2>
          {/* Removed underline div as requested */}
          <p className="text-gray-500 text-center max-w-2xl">
            Confira as últimas tendências que acabaram de chegar.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : !hasProducts ? (
          <div className="text-center py-10 text-gray-500">
            Nenhum produto encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                priority={index < 2}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/produtos?sort=newest"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:opacity-70 transition-opacity"
          // Removed border-b as requested
          >
            Ver tudo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
