'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { ArrowRight } from 'phosphor-react'

const ContactSkeleton = () => (
  <section className="py-24 md:py-32 bg-sand-100 relative overflow-hidden">
    <div className="container mx-auto px-4 sm:px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 md:mb-20 space-y-6">
          <div className="h-8 w-40 bg-black/20 rounded-full mx-auto animate-pulse" />
          <div className="h-12 md:h-16 w-full max-w-2xl bg-black/30 rounded-lg mx-auto animate-pulse" />
          <div className="h-6 w-full max-w-xl bg-black/20 rounded mx-auto animate-pulse" />
        </div>
        <div className="h-12 w-64 bg-black/40 rounded-xl mx-auto animate-pulse" />
      </div>
    </div>
  </section>
)

export function ContactSection() {
  return (
    <section className="py-24 md:py-32 bg-sand-100 relative overflow-hidden">
      <div className="custom-shape-divider-top absolute top-0 left-0 w-full overflow-hidden leading-none pointer-events-none" style={{ 
        zIndex: 1,
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        backgroundColor: '#0d0d0d'
      }}>
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[20px] md:h-[100px]"
          style={{ width: 'calc(100% + 1.3px)', transform: 'scaleX(-1) scaleY(-1)' }}
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="#FDF8F2"
          />
        </svg>
      </div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-primary-700 rounded-full"
            >
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="text-primary-600 text-sm" 
              />
              <span className="text-xs uppercase tracking-[0.25em] text-primary-700 font-semibold">
                Entre em Contato
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-sage-900 mb-6"
            >
              Fale{' '}
              <span className="bg-gradient-to-r from-primary-500 via-primary-700 to-primary-500 bg-clip-text text-transparent">
                Conosco
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg md:text-xl text-sage-700 max-w-2xl mx-auto leading-relaxed"
            >
              Estamos prontos para ajudar você com qualquer dúvida sobre nossos produtos ou pedidos.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <Link href="/contato">
              <motion.button
                whileHover={{ 
                  scale: 1.02, 
                  y: -1,
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ 
                  duration: 0.35, 
                  ease: [0.25, 0.46, 0.45, 0.94] 
                }}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary-500 text-sand-100 rounded-xl font-semibold text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary-500/25 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                <span 
                  className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  ENTRAR EM CONTATO
                </span>
                <div
                  className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                >
                  <ArrowRight size={18} weight="thin" />
                </div>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
export const NewsletterSection = ContactSection
