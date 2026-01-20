'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { EnvelopeSimple, CheckCircle, XCircle, Spinner } from 'phosphor-react';
import { motion } from 'framer-motion';
function VerificarEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const alreadyChecked = useRef(false);
  useEffect(() => {
    if (alreadyChecked.current) return;
    alreadyChecked.current = true;
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado.');
      return;
    }
    const verifyToken = async () => {
      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erro interno do servidor.');
      }
    };
    verifyToken();
  }, [searchParams, verifyEmail, router]);
  return (
    <section className="flex items-center justify-center bg-sand-100 px-4 pb-16 lg:pb-20 lg:mt-20" style={{ marginTop: '10.5rem', minHeight: 'calc(100vh - 10.5rem)', paddingTop: '2rem' }}>
      <div className="w-full max-w-md bg-primary-50 rounded-3xl shadow-xl p-8 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-16 h-16 mb-2">
            <Image src="/images/logo.png" alt="Luxúria Modas Logo" fill sizes="64px" className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-extrabold text-sage-900 mb-2 text-center">Verificação de E-mail</h1>
          <p className="text-sage-800 text-center text-sm">Verificando sua conta...</p>
        </div>
        <div className="text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sage-800">Verificando seu e-mail...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-50 border-2 border-green-500 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" weight="fill" />
              </div>
              <p className="text-green-700 font-semibold text-lg">{message}</p>
              <p className="text-sage-800 text-sm">Redirecionando para a página inicial...</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-50 border-2 border-red-500 rounded-full flex items-center justify-center">
                <XCircle size={32} className="text-red-600" weight="fill" />
              </div>
              <p className="text-red-700 font-semibold text-lg mb-2">{message}</p>
              <motion.button
                onClick={() => router.push('/login')}
                whileHover={{
                  scale: 1.02,
                  y: -1,
                }}
                whileTap={{ scale: 0.97 }}
                transition={{
                  duration: 0.35,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="group relative mt-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg w-full shadow-lg shadow-primary-500/20 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
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
                  Ir para o Login
                </span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <section className="flex items-center justify-center bg-sand-100 px-4 pb-16 lg:pb-20 lg:mt-20" style={{ marginTop: '10.5rem', minHeight: 'calc(100vh - 10.5rem)', paddingTop: '2rem' }}>
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </section>
    }>
      <VerificarEmailContent />
    </Suspense>
  );
} 
