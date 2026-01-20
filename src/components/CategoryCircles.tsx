'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

// Using Unsplash source URLs for reliable placeholders since local images are missing
const categories = [
    { id: 1, name: 'Feminino', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=200&q=80', href: '/produtos?categoria=feminino' },
    { id: 2, name: 'Masculino', image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=200&q=80', href: '/produtos?categoria=masculino' },
    { id: 3, name: 'Infantil', image: 'https://images.unsplash.com/photo-1471286174890-9c808743015a?auto=format&fit=crop&w=200&q=80', href: '/produtos?categoria=infantil' },
    { id: 4, name: 'Jeans', image: 'https://images.unsplash.com/photo-1542272617-08f08630329e?auto=format&fit=crop&w=200&q=80', href: '/produtos?categoria=jeans' },
    { id: 5, name: 'Esportivo', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=200&q=80', href: '/produtos?categoria=esportivo' },
    { id: 6, name: 'Acessórios', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=200&q=80', href: '/produtos?categoria=acessorios' },
    { id: 7, name: 'Calçados', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=200&q=80', href: '/produtos?categoria=calcados' },
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
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-black transition-all duration-300 relative bg-gray-100"
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
