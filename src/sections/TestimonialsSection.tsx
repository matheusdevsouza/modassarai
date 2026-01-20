'use client'
import { motion } from 'framer-motion'
import { Star, MapPin } from 'lucide-react'

// Mock Data
const testimonials = [
  {
    id: 1,
    name: 'Ana Cláudia',
    role: 'Cliente Verified',
    comment: 'Amei a qualidade das peças! O tecido é incrível e o caimento perfeito. Chegou super rápido.',
    rating: 5,
    date: 'há 2 dias',
    location: 'São Paulo, SP'
  },
  {
    id: 2,
    name: 'Mariana Costa',
    role: 'Cliente Verified',
    comment: 'Primeira vez que compro e já virei fã. O atendimento no WhatsApp foi super atencioso.',
    rating: 5,
    date: 'há 1 semana',
    location: 'Rio de Janeiro, RJ'
  },
  {
    id: 3,
    name: 'Juliana Silva',
    role: 'Cliente Verified',
    comment: 'As roupas são ainda mais lindas pessoalmente. Comprei um vestido para uma festa e arrasei!',
    rating: 5,
    date: 'há 2 semanas',
    location: 'Belo Horizonte, MG'
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#333333] mb-4">
            Quem comprou, amou
          </h2>
          <div className="mb-8"></div>
          <p className="text-gray-500 font-light max-w-xl mx-auto">
            Junte-se a milhares de clientes satisfeitas que escolheram a Luxúria Modas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 p-8 rounded-xl relative group hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-[#333333] mb-6 leading-relaxed text-sm font-light italic">
                &quot;{testimonial.comment}&quot;
              </p>
              <div className="flex items-center justify-between mt-auto border-t border-gray-200 pt-4">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-black">{testimonial.name}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} />
                    {testimonial.location}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{testimonial.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
