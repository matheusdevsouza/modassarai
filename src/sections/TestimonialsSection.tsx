'use client'
import { useState, useEffect } from 'react'
import { Star, ChatCircle } from 'phosphor-react'

interface Testimonial {
  id: number
  name: string
  location: string
  comment: string
  rating: number
}

// Mock data as fallback
const mockTestimonials: Testimonial[] = [
  { id: 1, name: 'Ana Silva', location: 'São Paulo, SP', comment: 'Amei as roupas! Qualidade impecável e entrega super rápida.', rating: 5 },
  { id: 2, name: 'Beatriz Santos', location: 'Rio de Janeiro, RJ', comment: 'O caimento das peças é perfeito. Com certeza comprarei novamente.', rating: 5 },
  { id: 3, name: 'Carla Oliveira', location: 'Belo Horizonte, MG', comment: 'Atendimento excelente e produtos maravilhosos. Recomendo!', rating: 4 },
]

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(mockTestimonials)
  // Logic to fetch from API could be added here, keeping mock for now/fallback

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-black uppercase tracking-wider mb-2">
            Depoimentos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((t) => (
            <div key={t.id} className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex gap-1 mb-4 text-black">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} weight={i < t.rating ? 'fill' : 'regular'} />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">&quot;{t.comment}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-black">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
