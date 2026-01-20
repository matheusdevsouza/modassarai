'use client'
import { Truck, CreditCard, ArrowCounterClockwise, ShieldCheck } from 'phosphor-react'

const benefits = [
  {
    id: 1,
    icon: Truck,
    title: 'Frete Grátis',
    description: 'Em compras acima de R$ 299'
  },
  {
    id: 2,
    icon: CreditCard,
    title: 'Parcele em 10x',
    description: 'Sem juros no cartão'
  },
  {
    id: 3,
    icon: ArrowCounterClockwise,
    title: 'Troca Fácil',
    description: 'Até 30 dias para trocar'
  },
  {
    id: 4,
    icon: ShieldCheck,
    title: 'Compra Segura',
    description: 'Seus dados protegidos'
  }
]

export function MissionValuesVisionSection() {
  return (
    <section className="py-8 bg-gray-50 border-t border-gray-100 border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div key={benefit.id} className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <Icon size={24} className="text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black uppercase">{benefit.title}</h3>
                  <p className="text-xs text-gray-500">{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
