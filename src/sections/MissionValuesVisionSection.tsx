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
    <section className="py-6 bg-gray-50 border-t border-gray-100 border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div key={benefit.id} className="flex items-center gap-3 text-left min-w-max">
                <Icon size={24} className="text-[#333333] flex-shrink-0" weight="light" />
                <div className="flex flex-col">
                  <h3 className="font-semibold text-sm text-[#333333] leading-tight">{benefit.title}</h3>
                  <p className="text-xs text-gray-500 leading-tight">{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
