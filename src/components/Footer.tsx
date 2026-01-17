'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faInstagram,
  faTiktok,
  faWhatsapp
} from '@fortawesome/free-brands-svg-icons'
import {
  faArrowUp,
  faLocationDot,
  faPhone,
  faEnvelope,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons'

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
  const [email, setEmail] = useState('')

  const handleScroll = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Newsletter signup:', email)
    setEmail('')
  }

  return (
    <footer className="bg-sand-100 border-t border-cloud-200">
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/logo.png"
                alt="Modas Saraí"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>

            <p className="text-sm text-sage-600 mb-5 leading-relaxed max-w-xs">
              Moda feminina contemporânea, leve e sofisticada para todos os momentos da sua vida.
            </p>

            {/* Clean Contact Info - No backgrounds/borders */}
            <div className="space-y-2 mb-5 text-sm text-sage-600">
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-primary-500 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">Shopping Novo Porto Brás - Box 2562 (2º Andar) - R. Tiers, 282 - Canindé, São Paulo, SP</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <a href="tel:5511930055418" className="hover:text-primary-600 transition-colors">+55 11 93005-5418</a>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <a href="mailto:contato@modassarai.com.br" className="hover:text-primary-600 transition-colors">contato@modassarai.com.br</a>
              </div>
            </div>

            {/* Simple Social Links - No backgrounds */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-sage-500">Siga-nos:</span>
              <a
                href="https://www.instagram.com/modassarai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-500 hover:text-pink-500 transition-colors duration-300"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com/@modassarai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-500 hover:text-sage-900 transition-colors duration-300"
                aria-label="TikTok"
              >
                <FontAwesomeIcon icon={faTiktok} className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/5511930055418"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-500 hover:text-green-500 transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key} className="lg:col-span-2">
              <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-sage-600 hover:text-primary-600 transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-sage-600 mb-4 leading-relaxed">
              Receba novidades e ofertas exclusivas!
            </p>

            <form onSubmit={handleNewsletterSubmit}>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white border border-cloud-200 border-r-0 rounded-l-lg px-4 py-3 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-all duration-300 text-sm"
                  required
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 rounded-r-lg flex items-center justify-center transition-all duration-300"
                  aria-label="Inscrever-se"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-cloud-200 bg-sand-50">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-sage-600 text-center md:text-left">
              © {new Date().getFullYear()} Modas Saraí. Todos os direitos reservados.
              <br className="md:hidden" />
              <span className="hidden md:inline"> | </span>
              CNPJ: 31.434.414/0001-52
            </p>

          </div>
        </div>
      </div>

      <motion.button
        onClick={handleScroll}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-40 w-12 h-12 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-all duration-300"
        aria-label="Voltar ao topo"
      >
        <FontAwesomeIcon icon={faArrowUp} className="w-5 h-5" />
      </motion.button>

      <motion.a
        href="https://wa.me/5511930055418?text=Olá! Gostaria de saber mais sobre os produtos da Modas Saraí."
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-all duration-300"
        aria-label="Contato via WhatsApp"
      >
        <FontAwesomeIcon icon={faWhatsapp} className="w-7 h-7" />
      </motion.a>
    </footer>
  )
}