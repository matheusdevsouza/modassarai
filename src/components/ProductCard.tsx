'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag } from 'lucide-react'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useCart } from '@/contexts/CartContext'

interface ProductCardProps {
    product: {
        id: string | number
        name: string
        slug: string
        price: number
        originalPrice?: number
        promotionalPrice?: number
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

    // Determine effective price and original price
    const currentPrice = product.promotionalPrice || product.price
    const oldPrice = product.originalPrice || (product.promotionalPrice ? product.price : undefined)
    const hasDiscount = oldPrice && currentPrice < oldPrice

    // Calculate discount percentage if not explicitly provided
    const discountPercentage = hasDiscount ? calculateDiscount(oldPrice, currentPrice) : 0

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
                price: currentPrice,
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
            price: currentPrice,
            image: imageUrl
        } as any, 1, undefined, undefined, imageUrl)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group relative flex flex-col h-full bg-white transition-all duration-300 rounded-lg"
        >
            <Link href={`/produto/${product.slug}`} className="flex-1 block relative overflow-hidden rounded-lg">
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 rounded-lg">
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.95]"
                        priority={priority}
                    />

                    {/* Gradient Overlay for better contrast */}
                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide rounded-sm z-10">
                            -{discountPercentage}%
                        </div>
                    )}

                    {/* Favorite Button */}
                    <button
                        onClick={handleFavoriteClick}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 z-10 ${isFavorited ? 'bg-white/90 text-red-500 shadow-md' : 'bg-white/80 text-black hover:bg-white hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100'}`}
                        aria-label="Favoritar"
                    >
                        <Heart size={18} strokeWidth={isFavorited ? 0 : 1.5} fill={isFavorited ? 'currentColor' : 'none'} />
                    </button>

                    {/* Add to Cart Button (Hover) */}
                    <div className="absolute bottom-0 left-0 w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-black/90 text-white font-medium text-xs py-3 tracking-wide hover:bg-black transition-colors rounded shadow-lg backdrop-blur-sm flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={16} strokeWidth={1.5} />
                            Adicionar
                        </button>
                    </div>
                </div>

                {/* Info Container */}
                <div className="pt-3 pb-1 flex flex-col items-start px-1">
                    <h3 className="text-[13px] text-[#333333] group-hover:text-black line-clamp-1 h-5 overflow-hidden mb-1 font-normal">
                        {product.name}
                    </h3>

                    <div className="flex flex-col items-start gap-0.5">
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through font-light">
                                {formatPrice(oldPrice)}
                            </span>
                        )}
                        <span className="text-sm font-bold text-[#333333]">
                            {formatPrice(currentPrice)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-light mt-0.5">
                            5x de {formatPrice(currentPrice / 5)} s/ juros
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
            <div className="aspect-[3/4] bg-gray-100 w-full mb-3 relative overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-shimmer" />
            </div>
            <div className="h-3 bg-gray-100 w-3/4 mb-2 rounded mx-1" />
            <div className="h-3 bg-gray-100 w-1/2 rounded mx-1" />
        </div>
    )
}
