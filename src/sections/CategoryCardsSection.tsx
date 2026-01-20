'use client'
import Image from 'next/image'
import Link from 'next/link'

const categories = [
    {
        id: 1,
        title: 'Feminino',
        image: 'https://images.unsplash.com/photo-1550614000-4b9519e0921f?auto=format&fit=crop&w=600&q=80', // Stable fashion model
        link: '/produtos?categoria=feminino'
    },
    {
        id: 2,
        title: 'Masculino',
        image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=600&q=80', // Kept working one
        link: '/produtos?categoria=masculino'
    },
    {
        id: 3,
        title: 'Infantil',
        image: 'https://images.unsplash.com/photo-1622290291314-883f94739e89?auto=format&fit=crop&w=600&q=80', // Stable kids
        link: '/produtos?categoria=infantil'
    },
    {
        id: 4,
        title: 'Esportivo',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
        link: '/produtos?categoria=esportivo'
    },
    {
        id: 5,
        title: 'Acessórios',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80',
        link: '/produtos?categoria=acessorios'
    },
    {
        id: 6,
        title: 'Calçados',
        image: 'https://images.unsplash.com/photo-1560343076-ec3437f9b6c0?auto=format&fit=crop&w=600&q=80', // Shoes
        link: '/produtos?categoria=calcados'
    }
]

export function CategoryCardsSection() {
    return (
        <section className="w-full bg-white py-16">
            <div className="container mx-auto px-4">
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-8 ml-2 text-black">
                    Navegue por Categoria
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={cat.link}
                            className="group relative h-[400px] w-full overflow-hidden block"
                        >
                            <Image
                                src={cat.image}
                                alt={cat.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                                <span className="text-white font-bold uppercase tracking-wider text-sm border-b-2 border-transparent group-hover:border-white pb-1 transition-all">
                                    {cat.title}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
