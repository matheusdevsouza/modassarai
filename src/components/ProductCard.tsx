'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag } from 'phosphor-react'
import { formatPrice } from '@/lib/utils'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useCart } from '@/contexts/CartContext'

interface ProductCardProps {
    product: {
        id: string | number
        name: string
        slug: string
        price: number
        primary_image?: string
        images?: { url: string }[]
    }
    index?: number
    priority?: boolean
    variant?: 'default' | 'compact'
}

export function ProductCard({ product, index = 0, priority = false, variant = 'default' }: ProductCardProps) {
    const { addFavorite, removeFavorite, isProductFavorite, getProductFavoriteId } = useFavorites()
    const { addItem } = useCart()
    const isFavorited = isProductFavorite(String(product.id))

    const imageUrl = product.primary_image ||
        (product.images && product.images[0]?.url) ||
        '/images/logo.png'

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isFavorited) {
            const favoriteId = getProductFavoriteId(String(product.id))
            if (favoriteId) removeFavorite(favoriteId)
        } else {
            addFavorite({
                id: String(product.id),
                name: product.name,
                slug: product.slug,
                price: product.price,
                description: '',
                categoryId: '',
                stock: 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any, undefined, undefined, imageUrl)
        }
    }

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            ...product,
            id: String(product.id),
            image: imageUrl
        } as any, 1, undefined, undefined, imageUrl)
        // You could add a toast notification here
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group relative flex flex-col h-full bg-white"
        >
            <Link href={`/produto/${product.slug}`} className="flex-1 block relative overflow-hidden">
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        priority={priority}
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Favorite Button */}
                    <button
                        onClick={handleFavoriteClick}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 z-10 ${isFavorited ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white shadow-sm'}`}
                        aria-label="Favoritar"
                    >
                        <Heart weight={isFavorited ? 'fill' : 'regular'} size={20} />
                    </button>

                    {/* Add to Cart Button (Hover) */}
                    <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-black text-white font-bold uppercase text-xs py-3 tracking-wider hover:bg-gray-900 transition-colors shadow-lg"
                        >
                            Adicionar à Sacola
                        </button>
                    </div>
                </div>

                {/* Info Container */}
                <div className="pt-4 pb-2 flex flex-col text-center">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-black line-clamp-1 h-5 overflow-hidden mb-1">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-center mt-1">
                        <span className="text-base font-bold text-black">
                            {formatPrice(product.price)}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export function ProductCardSkeleton() {
    return (
        <div className="flex flex-col h-full animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 w-full mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
            </div>
            <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded mx-auto" />
            <div className="h-4 bg-gray-200 w-1/2 rounded mx-auto" />
        </div>
    )
}
