'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'

export function MasonryCollectionSection() {
    const [products, setProducts] = useState<any[]>([])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch 3 items for the grid slots
                // We use 'random' or 'featured' if available, or just newest
                const res = await fetch('/api/products?limit=3&sort=newest')
                const data = await res.json()
                if (data.success) {
                    setProducts(data.data)
                }
            } catch (error) {
                console.error('Error fetching masonry products:', error)
            }
        }
        fetchProducts()
    }, [])

    return (
        <section className="w-full py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-10 text-black">Coleção Outono/Inverno</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[400px]">
                    {/* Large Lifestyle Image */}
                    <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden">
                        <Image
                            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80"
                            alt="Lifestyle Outono"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute bottom-10 left-10 text-white">
                            <span className="uppercase tracking-widest text-sm font-bold mb-2 block">Tendência</span>
                            <h3 className="text-4xl sm:text-5xl font-black mb-6 uppercase">Urban Chic</h3>
                            <Link href="/produtos?colecao=outono" className="inline-block bg-white text-black font-bold py-3 px-8 uppercase text-sm hover:bg-black hover:text-white transition-all">Ver Coleção</Link>
                        </div>
                    </div>

                    {/* Product 1 */}
                    <div className="relative group overflow-hidden bg-white">
                        {products[0] ? (
                            <Link href={`/produto/${products[0].slug}`} className="block w-full h-full">
                                <Image
                                    src={products[0].image || '/images/logo.png'}
                                    alt={products[0].name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-white/95 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="font-bold text-sm uppercase line-clamp-1">{products[0].name}</p>
                                    <p className="text-gray-600 text-xs">{formatPrice(products[0].price)}</p>
                                </div>
                            </Link>
                        ) : (
                            <div className="w-full h-full bg-gray-100 animate-pulse" />
                        )}
                    </div>

                    {/* Product 2 */}
                    <div className="relative group overflow-hidden bg-white">
                        {products[1] ? (
                            <Link href={`/produto/${products[1].slug}`} className="block w-full h-full">
                                <Image
                                    src={products[1].image || '/images/logo.png'}
                                    alt={products[1].name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-white/95 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="font-bold text-sm uppercase line-clamp-1">{products[1].name}</p>
                                    <p className="text-gray-600 text-xs">{formatPrice(products[1].price)}</p>
                                </div>
                            </Link>
                        ) : (
                            <div className="w-full h-full bg-gray-100 animate-pulse" />
                        )}
                    </div>

                    {/* Medium Lifestyle Image */}
                    <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden">
                        <Image
                            src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80"
                            alt="Lifestyle Detalhe"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-2xl font-black uppercase">Acessórios</h3>
                        </div>
                    </div>

                    {/* Product 3 */}
                    <div className="relative group overflow-hidden bg-white">
                        {products[2] ? (
                            <Link href={`/produto/${products[2].slug}`} className="block w-full h-full">
                                <Image
                                    src={products[2].image || '/images/logo.png'}
                                    alt={products[2].name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-white/95 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="font-bold text-sm uppercase line-clamp-1">{products[2].name}</p>
                                    <p className="text-gray-600 text-xs">{formatPrice(products[2].price)}</p>
                                </div>
                            </Link>
                        ) : (
                            <div className="w-full h-full bg-gray-100 animate-pulse" />
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
