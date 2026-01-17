'use client';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import TwoFactorModal from '@/components/TwoFactorModal';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [sending2FACode, setSending2FACode] = useState(false);

  const { login, resendVerification, checkAuth } = useAuth();
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setShowResendVerification(false);
    setShow2FAModal(false);

    try {
      const response = await fetch('/api/auth/send-2fa-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setSessionToken(data.sessionToken);
        setExpiresAt(data.expiresAt);
        setShow2FAModal(true);
        setMessage({
          type: 'success',
          text: 'Código de verificação enviado para seu e-mail!'
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao enviar código de verificação' });
        if (data.emailNotVerified) {
          setShowResendVerification(true);
          setResendEmail(formData.email);
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar código 2FA:', error);
      setMessage({ type: 'error', text: 'Erro interno do servidor. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend2FACode = async (): Promise<{ success: boolean; message?: string; retryAfter?: number }> => {
    if (sending2FACode) {
      return { success: false, message: 'Aguarde...' };
    }

    setSending2FACode(true);
    try {
      const response = await fetch('/api/auth/send-2fa-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setSessionToken(data.sessionToken);
        setExpiresAt(data.expiresAt);
        return {
          success: true,
          message: 'Código reenviado com sucesso!',
          retryAfter: data.retryAfter || 60
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erro ao reenviar código',
          retryAfter: data.retryAfter || 60
        };
      }
    } catch (error) {
      console.error('Erro ao reenviar código 2FA:', error);
      return { success: false, message: 'Erro ao reenviar código. Tente novamente.' };
    } finally {
      setSending2FACode(false);
    }
  };

  const handle2FASuccess = async () => {
    setShow2FAModal(false);
    setMessage({ type: 'success', text: 'Login realizado com sucesso!' });

    try {
      const meResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      const meData = await meResponse.json();

      if (meData.success && meData.user) {
        await checkAuth();

        setTimeout(() => {
          if (meData.user.is_admin) {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }, 500);
      } else {
        setTimeout(() => {
          router.push('/');
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao atualizar contexto após login 2FA:', error);
      setTimeout(() => {
        router.push('/');
      }, 500);
    }
  };
  const handleResendVerification = async () => {
    if (!resendEmail) return;
    setLoading(true);
    try {
      const result = await resendVerification(resendEmail);
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao reenviar verificação' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="flex items-center justify-center bg-sand-100 px-4 pb-16 lg:pb-20" style={{ marginTop: '10.5rem', minHeight: 'calc(100vh - 10.5rem)', paddingTop: '2rem' }}>
      <div className="w-full max-w-md bg-primary-50 rounded-xl shadow-xl p-8 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16 mb-2">
            <Image src="/images/logo.png" alt="Modas Saraí Logo" fill sizes="64px" className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-semibold text-sage-900 mb-2 text-center">Entrar na sua conta</h1>
          <p className="text-sage-800 text-center text-sm">Bem-vindo de volta! Faça login para continuar.</p>
        </div>
        {message && (
          <div className={`p-4 rounded-lg text-sm ${message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sage-900 font-medium text-sm">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg bg-white border border-cloud-100 text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
              placeholder="Digite seu e-mail"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sage-900 font-medium text-sm">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg bg-white border border-cloud-100 text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
              placeholder="Digite sua senha"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <Link href="/esqueci-senha" className="text-primary-600 text-sm hover:underline font-medium">Esqueceu a senha?</Link>
            <Link href="/criar-conta" className="text-sage-700 text-sm hover:text-primary-600 hover:underline font-medium">Criar conta</Link>
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
              {loading ? 'Entrando...' : 'Entrar'}
            </span>
          </motion.button>
        </form>
        {showResendVerification && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm mb-3">
              Não recebeu o e-mail de verificação?
            </p>
            <motion.button
              onClick={handleResendVerification}
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
              className="group relative w-full bg-primary-500 hover:bg-primary-600 disabled:bg-cloud-200 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-md shadow-primary-500/20 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
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
                {loading ? 'Enviando...' : 'Reenviar E-mail de Verificação'}
              </span>
            </motion.button>
          </div>
        )}
      </div>

      <TwoFactorModal
        isOpen={show2FAModal}
        email={formData.email}
        password={formData.password}
        sessionToken={sessionToken}
        expiresAt={expiresAt}
        onClose={() => {
          setShow2FAModal(false);
          setSessionToken(null);
          setExpiresAt(null);
        }}
        onSuccess={handle2FASuccess}
        onResendCode={handleResend2FACode}
      />
    </section>
  );
}