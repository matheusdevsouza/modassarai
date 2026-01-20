'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const categories = [
    { id: 1, name: 'Feminino', image: '/images/cat-feminino.jpg', href: '/produtos?categoria=feminino' },
    { id: 2, name: 'Masculino', image: '/images/cat-masculino.jpg', href: '/produtos?categoria=masculino' },
    { id: 3, name: 'Infantil', image: '/images/cat-infantil.jpg', href: '/produtos?categoria=infantil' },
    { id: 4, name: 'Jeans', image: '/images/cat-jeans.jpg', href: '/produtos?categoria=jeans' },
    { id: 5, name: 'Esportivo', image: '/images/cat-masculino.jpg', href: '/produtos?categoria=esportivo' },
    { id: 6, name: 'Acessórios', image: '/images/cat-acessorios.jpg', href: '/produtos?categoria=acessorios' },
    { id: 7, name: 'Calçados', image: '/images/cat-jeans.jpg', href: '/produtos?categoria=calcados' },
]

export function CategoryCircles() {
    return (
        <section className="py-8 bg-white border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex justify-center gap-4 sm:gap-8 overflow-x-auto pb-4 scrollbar-hide px-2">
                    {categories.map((cat, index) => (
                        <Link
                            key={cat.id}
                            href={cat.href}
                            className="flex flex-col items-center gap-2 group min-w-[80px]"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-black/20 transition-all duration-300 relative bg-gray-100 group-hover:shadow-lg"
                            >
                                <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-black transition-colors">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
