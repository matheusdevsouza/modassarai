'use client'
import React, { useMemo, useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeSlash } from 'phosphor-react'
export const dynamic = 'force-dynamic'

function ResetPasswordInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'Token ausente ou inválido. Solicite novamente a redefinição.' })
    }
  }, [token])

  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const errors = []
    if (password.length < minLength) errors.push(`Mínimo de ${minLength} caracteres`)
    if (!hasUpperCase) errors.push('Pelo menos uma letra maiúscula')
    if (!hasLowerCase) errors.push('Pelo menos uma letra minúscula')
    if (!hasNumbers) errors.push('Pelo menos um número')
    if (!hasSpecialChar) errors.push('Pelo menos um caractere especial')
    return {
      isValid: errors.length === 0,
      errors,
      strength: Math.max(0, 5 - errors.length)
    }
  }

  const passwordValidation = validatePassword(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    
    if (!token) {
      setMessage({ type: 'error', text: 'Token inválido' })
      return
    }
    
    if (!password || !confirmPassword) {
      setMessage({ type: 'error', text: 'Informe a nova senha e a confirmação' })
      return
    }
    
    if (!passwordValidation.isValid) {
      setMessage({ type: 'error', text: 'A senha não atende aos requisitos de segurança' })
      return
    }
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não conferem' })
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Senha redefinida com sucesso! Você já pode fazer login.' })
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Não foi possível redefinir sua senha' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao processar. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500'
    if (strength <= 2) return 'bg-orange-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return 'Muito fraca'
    if (strength <= 2) return 'Fraca'
    if (strength <= 3) return 'Média'
    if (strength <= 4) return 'Forte'
    return 'Muito forte'
  }

  return (
    <section className="flex items-center justify-center bg-sand-100 px-4 pb-16 lg:pb-20" style={{ marginTop: '10.5rem', minHeight: 'calc(100vh - 10.5rem)', paddingTop: '2rem' }}>
      <div className="w-full max-w-md bg-primary-50 rounded-xl shadow-xl p-8 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16 mb-2">
            <Image src="/images/logo.png" alt="Maria Pistache Logo" fill sizes="64px" className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-semibold text-sage-900 mb-2 text-center">Redefinir Senha</h1>
          <p className="text-sage-800 text-center text-sm">Crie uma nova senha para sua conta.</p>
        </div>
        
        {message && (
          <div className={`p-4 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sage-900 font-medium text-sm">Nova senha</label>
            <div className="relative">
            <input
              id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-3 pr-12 rounded-lg bg-white border border-cloud-100 text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all w-full"
                placeholder="Digite sua nova senha"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-600 hover:text-primary-600 transition-colors"
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-cloud-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordValidation.strength)}`}
                      style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordValidation.strength <= 2 ? 'text-red-600' :
                    passwordValidation.strength <= 3 ? 'text-yellow-600' :
                    passwordValidation.strength <= 4 ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {getPasswordStrengthText(passwordValidation.strength)}
                  </span>
                </div>
                <div className="text-xs text-sage-700 space-y-1">
                  <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : 'text-sage-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mínimo 8 caracteres
                  </div>
                  <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-sage-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Uma letra maiúscula
                  </div>
                  <div className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-sage-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Uma letra minúscula
                  </div>
                  <div className={`flex items-center gap-2 ${/\d/.test(password) ? 'text-green-600' : 'text-sage-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Um número
                  </div>
                  <div className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-sage-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Um caractere especial
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sage-900 font-medium text-sm">Confirmar nova senha</label>
            <div className="relative">
            <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-4 py-3 pr-12 rounded-lg bg-white border border-cloud-100 text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all w-full"
                placeholder="Confirme sua nova senha"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-600 hover:text-primary-600 transition-colors"
              >
                {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && (
              <div className={`text-xs flex items-center gap-2 ${
                password === confirmPassword ? 'text-green-600' : 'text-red-600'
              }`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {password === confirmPassword ? 'Senhas coincidem' : 'Senhas não coincidem'}
              </div>
            )}
          </div>

          <div className="flex items-center justify-start mt-2">
            <Link href="/login" className="text-primary-600 text-sm hover:underline font-medium">Ir para o login</Link>
          </div>

          <motion.button
            type="submit"
            disabled={loading || !token || !passwordValidation.isValid || password !== confirmPassword}
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
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </span>
          </motion.button>
        </form>
      </div>
    </section>
  )
}
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}> 
      <ResetPasswordInner />
    </Suspense>
  )
}
