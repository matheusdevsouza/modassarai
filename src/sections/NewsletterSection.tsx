'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEnvelope,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons'

export function ContactSection() {
  return (
    <section className="pt-32 md:pt-40 pb-24 md:pb-32 bg-sand-100 relative overflow-hidden">
      <div className="custom-shape-divider-top absolute top-0 left-0 w-full overflow-hidden leading-none pointer-events-none" style={{
        zIndex: 1,
        backgroundColor: '#1A1816',
        backgroundImage: `
          linear-gradient(rgba(196, 151, 105, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(196, 151, 105, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}>
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[10px] md:h-[30px]"
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
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 border border-sage-300/50 rounded-full bg-sage-100/50"
          >
            <FontAwesomeIcon icon={faEnvelope} className="text-sage-400 text-sm w-4 h-4" />
            <span className="text-xs uppercase tracking-[0.2em] text-sage-500 font-medium">
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
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary-500 via-primary-700 to-primary-500 bg-clip-text text-transparent">
                Conosco
              </span>
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-sage-500 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Estamos prontos para ajudar você com qualquer dúvida sobre nossos produtos ou pedidos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Link href="/contato">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary-500 text-sand-100 rounded-xl font-semibold text-sm tracking-wide shadow-lg shadow-primary-500/25 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30 hover:bg-primary-600"
              >
                <span className="relative z-10">
                  Falar com a Gente
                </span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export const NewsletterSection = ContactSection
