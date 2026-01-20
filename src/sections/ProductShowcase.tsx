'use client'
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'

interface Product {
    id: string
    name: string
    price: number
    image: string
    category: string
    badge?: string
    slug: string
    originalPrice?: number
    promotionalPrice?: number
    [key: string]: any
}

interface ProductShowcaseProps {
    title: string
    subtitle?: string
    products?: Product[]
    apiFilters?: Record<string, any>
    link?: string
    priority?: boolean
}

export function ProductShowcase({ title, subtitle, products: initialProducts, apiFilters, link = '/produtos', priority = false }: ProductShowcaseProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [products, setProducts] = useState<Product[]>(initialProducts || [])
    const [loading, setLoading] = useState(!initialProducts)

    useEffect(() => {
        if (!initialProducts && apiFilters) {
            const fetchProducts = async () => {
                try {
                    const queryParams = new URLSearchParams()
                    Object.entries(apiFilters).forEach(([key, value]) => {
                        if (value !== undefined) queryParams.append(key, String(value))
                    })

                    const res = await fetch(`/api/products?${queryParams.toString()}`)
                    const data = await res.json()

                    if (data.success) {
                        setProducts(data.data)
                    }
                } catch (error) {
                    console.error('Failed to fetch products for showcase:', error)
                } finally {
                    setLoading(false)
                }
            }
            fetchProducts()
        } else if (initialProducts) {
            setLoading(false)
        }
    }, [initialProducts, JSON.stringify(apiFilters)])

    return (
        <section className="w-full py-16 border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-10">
                    <div className="flex flex-col">
                        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2 text-black">
                            {title}
                        </h3>
                        {subtitle && <p className="text-gray-500 font-medium">{subtitle}</p>}
                    </div>
                    {link && (
                        <Link href={link} className="hidden md:block text-sm font-bold uppercase transition-colors hover:text-gray-600">
                            Ver Tudo
                        </Link>
                    )}
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="min-w-[280px] md:min-w-[300px] snap-start">
                                <ProductCardSkeleton />
                            </div>
                        ))
                    ) : products.length > 0 ? (
                        products.map((product, index) => (
                            <div key={product.id} className="min-w-[280px] md:min-w-[300px] snap-start">
                                <ProductCard
                                    product={product}
                                    index={index}
                                    priority={priority && index < 2}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center py-10 text-gray-400">
                            Nenhum produto encontrado nesta coleção.
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
