'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faEnvelope,
  faPhone
} from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { ArrowRight } from 'phosphor-react'
export function ContactSection() {
  return (
    <section className="py-24 md:py-32 bg-sand-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-24 right-0 w-64 h-64 bg-primary-500/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.06, 0.1, 0.06],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-[-96px] left-[-40px] w-72 h-72 bg-sage-500/15 rounded-full blur-3xl"
        />
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
          <div className="text-center mb-16 md:mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary-50 backdrop-blur-sm border border-primary-100 rounded-full"
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
              Estamos prontos para ajudar você com qualquer dúvida sobre nossos produtos ou pedidos
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
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    opacity: { 
                      duration: 0.5, 
                      ease: [0.25, 0.46, 0.45, 0.94] 
                    },
                    x: {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-opacity duration-500"
                />
                <motion.span 
                  className="relative z-10"
                  initial={{ x: 0 }}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  ENTRAR EM CONTATO
                </motion.span>
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative z-10"
                >
                  <ArrowRight size={18} weight="thin" />
                </motion.div>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
export const NewsletterSection = ContactSection
