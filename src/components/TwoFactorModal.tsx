'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeSimple, Spinner, X, Clock, ArrowCounterClockwise } from 'phosphor-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  email: string;
  password: string;
  sessionToken: string | null;
  expiresAt: string | null;
  onClose: () => void;
  onSuccess: () => void;
  onResendCode: () => Promise<{ success: boolean; message?: string; retryAfter?: number }>;
}

export default function TwoFactorModal({
  isOpen,
  email,
  password,
  sessionToken,
  expiresAt,
  onClose,
  onSuccess,
  onResendCode
}: TwoFactorModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && expiresAt) {
      const updateTimer = () => {
        const now = Date.now();
        const expiry = new Date(expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeRemaining(remaining);
      };

      updateTimer();
      timerIntervalRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [isOpen, expiresAt]);

  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownIntervalRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            if (cooldownIntervalRef.current) {
              clearInterval(cooldownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [resendCooldown]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = code.split('');
    newCode[index] = value.slice(-1);
    setCode(newCode.join('').slice(0, 6));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    setError(null);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setCode(pasted);
    
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
    
    setError(null);
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Por favor, insira o código completo de 6 dígitos');
      return;
    }

    if (!sessionToken) {
      setError('Erro: Token de sessão não encontrado. Solicite um novo código.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-2fa-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          code: code,
          sessionToken
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Código incorreto. Tente novamente.');
        setCode('');
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      setError('Erro ao verificar código. Tente novamente.');
      setCode('');
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setError(null);

    try {
      const result = await onResendCode();
      
      if (result.success) {
        setCode('');
        setResendCooldown(result.retryAfter || 60);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.message || 'Erro ao reenviar código');
        if (result.retryAfter) {
          setResendCooldown(result.retryAfter);
        }
      }
    } catch (error) {
      setError('Erro ao reenviar código. Tente novamente.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 md:p-10 relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-sage-500 hover:text-sage-700 transition-colors flex items-center justify-center p-1"
            disabled={loading}
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <EnvelopeSimple size={28} className="text-primary-600 sm:w-9 sm:h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-sage-900 mb-2 sm:mb-3 px-2">
              Verificação em Duas Etapas
            </h2>
            <p className="text-sage-600 text-xs sm:text-sm mb-1.5 sm:mb-2 px-2">
              Digite o código de 6 dígitos enviado para
            </p>
            <p className="text-sage-900 font-semibold text-sm sm:text-base break-all px-2">{email}</p>
          </div>

          {error && (
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <div className="mb-6 sm:mb-8">
            <div className="flex gap-2 sm:gap-3 justify-center px-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index] || ''}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white text-center text-2xl sm:text-3xl font-bold border-2 sm:border-[3px] border-primary-500 rounded-lg sm:rounded-xl focus:border-primary-500 focus:ring-2 sm:focus:ring-4 focus:ring-primary-200 transition-all shadow-sm hover:border-primary-600 disabled:opacity-50"
                  disabled={loading || (timeRemaining !== null && timeRemaining === 0)}
                />
              ))}
            </div>
            
            {timeRemaining !== null && timeRemaining > 0 && (
              <div className="mt-4 sm:mt-6 mb-4 sm:mb-6 flex items-center justify-center gap-2 text-sage-600 text-xs sm:text-sm px-2">
                <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Código expira em: <strong>{formatTime(timeRemaining)}</strong></span>
              </div>
            )}
            
            {timeRemaining !== null && timeRemaining === 0 && (
              <div className="mt-4 sm:mt-6 mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm text-center">
                Código expirado. Solicite um novo código.
              </div>
            )}
          </div>

          <motion.button
            onClick={handleVerify}
            disabled={loading || code.length !== 6 || (timeRemaining !== null && timeRemaining === 0)}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-cloud-200 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 rounded-lg mb-4 sm:mb-6 flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Spinner size={18} className="animate-spin sm:w-5 sm:h-5" />
                <span>Verificando...</span>
              </>
            ) : (
              'Verificar Código'
            )}
          </motion.button>

          <div className="text-center pt-2">
            <button
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium disabled:text-sage-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              {resendLoading ? (
                <>
                  <Spinner size={14} className="animate-spin sm:w-4 sm:h-4" />
                  <span>Enviando...</span>
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Reenviar em {formatTime(resendCooldown)}</span>
                </>
              ) : (
                <>
                  <ArrowCounterClockwise size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Reenviar Código</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

