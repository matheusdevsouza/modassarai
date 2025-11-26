'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { House, ArrowLeft, ShoppingBag } from 'phosphor-react'
export default function NotFound() {
  return (
    <div className="min-h-screen bg-sand-100 relative flex flex-col items-center justify-center overflow-hidden pt-48 md:pt-64 pb-12">
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="relative z-10 text-center px-4 max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="relative p-6 bg-primary-500 rounded-full shadow-lg">
            <ShoppingBag size={64} className="text-white" weight="duotone" />
          </div>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 mb-6 leading-none"
        >
          404
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-3xl md:text-4xl font-semibold text-sage-900 mb-4"
        >
          Esta página está fora de moda
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-sage-800 mb-8 leading-relaxed font-light"
        >
          Parece que você se perdeu na coleção! A página que você procura não existe ou foi movida. 
          Que tal explorar nossas <span className="text-primary-600 font-medium">peças exclusivas</span> e encontrar algo especial?
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/"
            className="group relative inline-flex items-center gap-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold uppercase tracking-wider px-8 py-4 rounded-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="relative z-10 flex items-center gap-3">
              <House size={20} weight="bold" />
              Voltar ao Início
            </span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="group relative inline-flex items-center gap-3 bg-transparent border border-cloud-200 hover:border-primary-500 text-sage-700 hover:text-primary-600 font-semibold uppercase tracking-wider px-8 py-4 rounded-xl overflow-hidden transition-all duration-300"
          >
             <span className="relative z-10 flex items-center gap-3">
              <ArrowLeft size={20} weight="bold" />
              Página Anterior
            </span>
          </button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-12 pt-8 border-t border-cloud-200"
        >
          <p className="text-sage-800 mb-4 font-light">Ou explore nossas coleções:</p>
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Link href="/produtos" className="text-primary-600 hover:text-primary-700 transition-colors duration-200 font-medium uppercase tracking-wider text-sm">
              Coleção Completa
            </Link>
            <span className="text-sage-500">•</span>
            <Link href="/produtos?categoria=vestidos" className="text-primary-600 hover:text-primary-700 transition-colors duration-200 font-medium uppercase tracking-wider text-sm">
              Vestidos
            </Link>
            <span className="text-sage-500">•</span>
            <Link href="/produtos?categoria=acessorios" className="text-primary-600 hover:text-primary-700 transition-colors duration-200 font-medium uppercase tracking-wider text-sm">
              Acessórios
            </Link>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}
