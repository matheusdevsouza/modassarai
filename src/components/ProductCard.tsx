'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import { formatPrice } from '@/lib/utils'
import { useFavorites } from '@/contexts/FavoritesContext'

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
    const isFavorited = isProductFavorite(String(product.id))

    const imageUrl = product.primary_image ||
        (product.images && product.images[0]?.url) ||
        '/images/logo.png'

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isFavorited) {
            const favoriteId = getProductFavoriteId(String(product.id))
            if (favoriteId) {
                removeFavorite(favoriteId)
            }
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

    const containerVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-30px' }}
            className="group"
        >
            <Link href={`/produto/${product.slug}`} className="block h-full">
                <div className="relative h-full bg-white/90 rounded-2xl overflow-hidden border border-sage-200/60 shadow-sm transition-all duration-300 ease-out hover:border-primary-300 hover:shadow-xl">
                    <div className="relative aspect-[3/4] overflow-hidden bg-sand-50">
                        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
                            <Image
                                src={imageUrl}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover"
                                priority={priority}
                            />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-sage-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <motion.button
                            onClick={handleFavoriteClick}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isFavorited
                                ? 'bg-primary-500 text-white shadow-lg'
                                : 'bg-white/90 text-sage-600 hover:bg-white hover:text-primary-500 shadow-md'
                                }`}
                            aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                            <FontAwesomeIcon
                                icon={isFavorited ? faHeartSolid : faHeartRegular}
                                className="w-4 h-4"
                            />
                        </motion.button>
                    </div>

                    <div className="p-4 lg:p-5 bg-white/90">
                        <h3 className="font-semibold text-sage-900 text-base mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300 min-h-[3rem]">
                            {product.name}
                        </h3>

                        <p className="text-xl lg:text-2xl font-bold text-primary-600 mb-4">
                            {formatPrice(product.price)}
                        </p>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary-500/25"
                        >
                            <span className="text-sm">Ver detalhes</span>
                            <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </motion.div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export function ProductCardSkeleton() {
    return (
        <div className="relative h-full bg-white/90 rounded-2xl overflow-hidden border border-sage-200/60 shadow-sm animate-pulse">
            <div className="aspect-[3/4] bg-gradient-to-br from-sand-100 to-cloud-100" />
            <div className="p-4 lg:p-5 space-y-3">
                <div className="h-5 bg-cloud-100 rounded w-3/4" />
                <div className="h-4 bg-cloud-100 rounded w-1/2" />
                <div className="h-7 bg-cloud-100 rounded w-1/3" />
                <div className="h-10 bg-cloud-100 rounded-lg w-full" />
            </div>
        </div>
    )
}
