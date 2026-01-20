'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Mock Data for Banners - In production this would come from the database or CMS
const promotionalBanners = [
    {
        id: 1,
        title: 'Nova Coleção Outono',
        subtitle: 'COLEÇÃO 2025',
        description: 'Tons terrosos e texturas aconchegantes para a nova estação.',
        imageUrl: '/images/noite-festa.jpg',
        link: '/produtos?colecao=outono',
        align: 'left', // Text alignment
        theme: 'dark' // Text color theme
    },
    {
        id: 2,
        title: 'Essenciais do Dia a Dia',
        subtitle: 'BASICS',
        description: 'Peças versáteis que combinam com tudo e duram para sempre.',
        imageUrl: '/images/elegancia-classe.jpg',
        link: '/produtos?categoria=basicos',
        align: 'right', // Keeping right alignment for visual balance
        theme: 'dark' // Changed to dark to ensure white text
    }
]

export function PromotionalBannerSection() {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                {/* Asymmetrical Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    {promotionalBanners.map((banner, index) => (
                        <motion.div
                            key={banner.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="relative aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/3] group overflow-hidden rounded-lg"
                        >
                            <Link href={banner.link} className="block w-full h-full relative">
                                {/* Image */}
                                <Image
                                    src={banner.imageUrl}
                                    alt={banner.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-90"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />

                                {/* Overlay - Enhanced for text contrast */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />

                                {/* Content */}
                                <div className={`absolute inset-0 p-8 md:p-12 flex flex-col justify-center ${banner.align === 'left' ? 'items-start text-left' : 'items-end text-right'
                                    }`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.3 + (index * 0.2) }}
                                        className={`flex flex-col ${banner.align === 'left' ? 'items-start' : 'items-end'}`}
                                    >
                                        {/* Logo above title */}
                                        <div className={`relative w-24 h-8 mb-6 opacity-90 ${banner.theme === 'light' ? 'invert-0' : 'invert brightness-0 bg-white/10 rounded px-2'}`}>
                                            <Image
                                                src="/images/logo.png"
                                                alt="Modas Saraí"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>

                                        <span className={`inline-block text-xs font-bold tracking-[0.2em] mb-3 ${banner.theme === 'light' ? 'text-[#333333]' : 'text-white'
                                            }`}>
                                            {banner.subtitle}
                                        </span>
                                        <h3 className={`text-3xl md:text-5xl font-light mb-4 ${banner.theme === 'light' ? 'text-[#333333]' : 'text-white'
                                            }`}>
                                            {banner.title}
                                        </h3>
                                        <p className={`hidden md:block text-base mb-8 max-w-xs ${banner.theme === 'light' ? 'text-[#666666]' : 'text-gray-200'
                                            } ${banner.align === 'left' ? '' : 'ml-auto'}`}>
                                            {banner.description}
                                        </p>

                                        <span className={`inline-flex items-center gap-3 text-xs font-bold tracking-widest py-4 px-8 transition-all hover:gap-5 ${banner.theme === 'light'
                                            ? 'bg-[#333] text-white hover:bg-black'
                                            : 'bg-white text-black hover:bg-gray-100'
                                            }`}>
                                            Ver Coleção
                                            <ArrowRight size={14} />
                                        </span>
                                    </motion.div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
