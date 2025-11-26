'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Truck, Package, Globe, Shield, Clock, ArrowRight, MagnifyingGlass } from 'phosphor-react'
import Image from 'next/image'

export default function RastreioPage() {
  const [trackingCode, setTrackingCode] = useState('')

  const open17Track = () => {
    if (trackingCode.trim()) {
      const url = `https://www.17track.net/pt#nums=${encodeURIComponent(trackingCode.trim())}`
      window.open(url, '_blank')
    } else {
      const url = `https://www.17track.net/pt`
      window.open(url, '_blank')
    }
  }

  return (
    <section className="min-h-screen bg-sand-100" style={{ marginTop: '10.5rem', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-6">
              <Truck size={40} className="text-white" weight="fill" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-sage-900 mb-4">
              Rastreamento de Pedidos
            </h1>
            <p className="text-xl text-sage-800 max-w-2xl mx-auto">
              Acompanhe seus pedidos em tempo real com o 17TRACK
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-primary-50 rounded-3xl p-8 md:p-12 mb-8 shadow-sm"
          >
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-sage-900 mb-4 flex items-center gap-3">
                <Globe size={32} className="text-primary-600" />
                O que é o 17TRACK?
              </h2>
              <div className="space-y-4 text-sage-900 leading-relaxed">
                <p className="text-lg">
                  O <span className="text-primary-600 font-semibold">17TRACK</span> é uma plataforma global de rastreamento de encomendas que permite acompanhar pacotes de mais de 170 transportadoras em todo o mundo.
                </p>
                <p>
                  Através do 17TRACK, você pode acompanhar seu pedido em tempo real, verificar o status da entrega, localizar onde seu pacote está e receber notificações sobre atualizações importantes.
                </p>
                <p>
                  É uma ferramenta confiável e segura, utilizada por milhões de pessoas em todo o mundo para acompanhar suas compras online.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <Package size={32} className="text-primary-600 mb-4" weight="fill" />
                <h3 className="text-xl font-semibold text-sage-900 mb-2">Rastreamento Global</h3>
                <p className="text-sage-800 text-sm">
                  Acompanhe pacotes de mais de 170 transportadoras internacionais e nacionais
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <Clock size={32} className="text-primary-600 mb-4" weight="fill" />
                <h3 className="text-xl font-semibold text-sage-900 mb-2">Atualizações em Tempo Real</h3>
                <p className="text-sage-800 text-sm">
                  Receba notificações instantâneas sobre o status e localização do seu pedido
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <Shield size={32} className="text-primary-600 mb-4" weight="fill" />
                <h3 className="text-xl font-semibold text-sage-900 mb-2">100% Seguro</h3>
                <p className="text-sage-800 text-sm">
                  Plataforma confiável e segura, utilizada por milhões de usuários no mundo todo
                </p>
              </motion.div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-sage-900 mb-4">
                Digite seu código de rastreio (opcional)
              </h3>
              <p className="text-sage-800 mb-4 text-sm">
                Se você já possui um código de rastreio, digite-o abaixo para ser redirecionado diretamente para a página de rastreamento do seu pedido no 17TRACK.
              </p>
              <div className="relative">
                <MagnifyingGlass 
                  size={20} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sage-600"
                  weight="bold"
                />
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Ex: BR123456789BR ou LP123456789CN"
                  className="w-full bg-white border border-cloud-100 rounded-xl px-12 py-4 text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      open17Track()
                    }
                  }}
                />
              </div>
            </div>

            <div className="text-center">
              <motion.button
                onClick={open17Track}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-primary-500/20 overflow-hidden transition-all duration-300"
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
                <span className="relative z-10">Rastrear no 17TRACK</span>
                <ArrowRight size={20} className="relative z-10" weight="bold" />
              </motion.button>
              <p className="text-sage-800 text-sm mt-4">
                Você será redirecionado para o site oficial do 17TRACK em uma nova aba
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-primary-50 rounded-3xl p-8 md:p-12 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-sage-900 mb-8 text-center">
              Como funciona?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 text-2xl font-bold">1</span>
                </div>
                <h3 className="text-sage-900 font-semibold mb-2">Receba seu código</h3>
                <p className="text-sage-800 text-sm">
                  Quando seu pedido for enviado, você receberá um código de rastreio por e-mail
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 text-2xl font-bold">2</span>
                </div>
                <h3 className="text-sage-900 font-semibold mb-2">Acesse o 17TRACK</h3>
                <p className="text-sage-800 text-sm">
                  Clique no botão acima para abrir o site do 17TRACK em uma nova aba
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 text-2xl font-bold">3</span>
                </div>
                <h3 className="text-sage-900 font-semibold mb-2">Acompanhe seu pedido</h3>
                <p className="text-sage-800 text-sm">
                  Cole o código de rastreio no 17TRACK e acompanhe seu pedido em tempo real
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
