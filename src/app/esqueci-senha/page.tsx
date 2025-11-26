'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Informe um e-mail válido')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Se o e-mail estiver cadastrado, você receberá um link de redefinição em breve.')
      } else {
        setError(data.message || 'Não foi possível processar sua solicitação')
      }
    } catch (err) {
      setError('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <section className="flex items-center justify-center bg-sand-100 px-4 pb-16 lg:pb-20" style={{ marginTop: '10.5rem', minHeight: 'calc(100vh - 10.5rem)', paddingTop: '2rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-primary-50 rounded-xl shadow-xl p-8 flex flex-col gap-8"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16 mb-2">
            <Image src="/images/logo.png" alt="Maria Pistache Logo" fill sizes="64px" className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-semibold text-sage-900 mb-2 text-center">Esqueci minha senha</h1>
          <p className="text-sage-800 text-center text-sm">Informe seu e-mail e enviaremos um link para redefinição de senha.</p>
        </div>
        {message && (
          <div className="p-4 rounded-lg text-sm bg-green-50 border border-green-200 text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="p-4 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sage-900 font-medium text-sm">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="px-4 py-3 rounded-lg bg-white border border-cloud-100 text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ 
              scale: 1.02, 
              y: -1,
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ 
              duration: 0.35, 
              ease: [0.25, 0.46, 0.45, 0.94] 
            }}
            className="group relative mt-4 bg-primary-500 hover:bg-primary-600 disabled:bg-cloud-200 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg text-sm w-full shadow-lg shadow-primary-500/20 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
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
            <span className="relative z-10">
              {loading ? 'Enviando...' : 'Enviar link de redefinição'}
            </span>
          </motion.button>
        </form>
        <div className="text-center">
          <Link href="/login" className="text-primary-600 text-sm hover:text-primary-700 hover:underline font-medium">Voltar ao login</Link>
        </div>
      </motion.div>
    </section>
  )
}
