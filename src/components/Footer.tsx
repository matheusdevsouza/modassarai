'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import {
  Instagram,
  MapPin,
  Phone,
  Mail,
  ArrowUp,

} from 'lucide-react'

const footerLinks = {
  informacoes: {
    title: 'Informações',
    links: [
      { label: 'Como Comprar', href: '/como-comprar' },
      { label: 'Entregas', href: '/entregas' },
      { label: 'Trocas e Devoluções', href: '/trocas-e-devolucoes' },
    ]
  },
  ajuda: {
    title: 'Ajuda',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Contato', href: '/contato' },
      { label: 'Rastrear Pedido', href: '/rastreio' },
    ]
  },
  institucional: {
    title: 'Institucional',
    links: [
      { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
      { label: 'Termos de Uso', href: '/termos-de-uso' },
    ]
  },
}

export function Footer() {
  const handleScroll = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }



  return (
    <footer className="bg-white border-t border-gray-100 font-sans">
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          <div className="lg:col-span-3">
            <Link href="/" className="inline-block mb-6 relative w-32 h-8">
              <Image
                src="/images/logo.png"
                alt="Modas Saraí"
                fill
                className="object-contain"
              />
            </Link>

            <p className="text-sm text-[#666666] mb-5 leading-relaxed max-w-xs font-light">
              Moda feminina contemporânea, leve e sofisticada para todos os momentos da sua vida.
            </p>

            {/* Simple Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#999999] font-medium">Siga-nos:</span>
              <a
                href="https://www.instagram.com/modassarai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#666666] hover:text-black transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key}>
                <h3 className="text-sm font-bold text-[#333333] mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#666666] hover:text-black transition-colors font-light"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-sm font-bold text-[#333333] mb-4">
              Fale Conosco
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg w-full">
                <MapPin size={20} className="text-black flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-400 mb-1">Endereço</span>
                  <span className="text-sm text-[#333333] leading-snug">
                    Shopping Novo Porto Brás<br />
                    R. Tiers, 282 - Box 2562 (2º Andar)<br />
                    Canínde, São Paulo - SP
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="tel:5511930055418" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Phone size={18} className="text-black" strokeWidth={1.5} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-400">Telefone</span>
                    <span className="text-sm text-[#333333] font-medium">+55 11 93005-5418</span>
                  </div>
                </a>

                <a href="mailto:contato@modassarai.com.br" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Mail size={18} className="text-black" strokeWidth={1.5} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-400">E-mail</span>
                    <span className="text-sm text-[#333333] font-medium">contato@modassarai.com.br</span>
                  </div>
                </a>
              </div>
            </div>


          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-[#F9F9F9]">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#999999] text-center md:text-left font-light">
              © {new Date().getFullYear()} Modas Saraí. CNPJ: 31.434.414/0001-52
            </p>
          </div>
        </div>
      </div>

      <motion.button
        onClick={handleScroll}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-40 w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#333333] transition-all duration-300"
        aria-label="Voltar ao topo"
      >
        <ArrowUp size={18} strokeWidth={1.5} />
      </motion.button>
    </footer>
  )
}