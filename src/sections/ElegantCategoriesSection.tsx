'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export function ElegantCategoriesSection() {
  const banners = [
    {
      id: 1,
      title: 'JEANSWEAR',
      subtitle: 'Conforto e estilo para o dia a dia',
      image: '/images/cat-jeans.jpg',
      href: '/produtos?categoria=jeans',
      button: 'VER JEANS'
    },
    {
      id: 2,
      title: 'VESTIDOS',
      subtitle: 'Leveza e sofisticação',
      image: '/images/noite-festa.jpg',
      href: '/produtos?categoria=vestidos',
      button: 'VER VESTIDOS'
    }
  ]

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {banners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.href}
              className="group relative h-[400px] sm:h-[500px] overflow-hidden bg-gray-100 block"
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

              <div className="absolute bottom-0 left-0 p-8 sm:p-12 w-full">
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
                  {banner.title}
                </h3>
                <p className="text-white/90 text-lg mb-6 font-medium">
                  {banner.subtitle}
                </p>
                <span className="inline-block px-8 py-3 bg-white text-black font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors duration-300">
                  {banner.button}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
