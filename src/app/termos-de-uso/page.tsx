'use client'
import React, { useState, useEffect } from 'react';
import { FaGavel, FaShieldAlt, FaExclamationTriangle, FaFileContract, FaUserShield, FaBalanceScale } from 'react-icons/fa';
import { motion } from 'framer-motion';
const TermosSkeleton = () => (
  <div className="min-h-screen bg-sand-100 pt-48 pb-12 px-4 md:px-0">
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <div className="h-12 bg-cloud-100 rounded-lg mx-auto max-w-md mb-4"></div>
        <div className="h-6 bg-cloud-100 rounded-md mx-auto max-w-lg"></div>
      </div>
      <div className="space-y-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-primary-50 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-cloud-100 rounded"></div>
              <div className="h-6 bg-cloud-100 rounded w-48"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-cloud-100 rounded w-full"></div>
              <div className="h-4 bg-cloud-100 rounded w-3/4"></div>
              <div className="h-4 bg-cloud-100 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
export default function TermosDeUso() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return <TermosSkeleton />;
  }
  return (
    <div className="min-h-screen bg-sand-100 pt-48 pb-12 px-4 md:px-0">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-sage-900 mb-4">Termos de Uso</h1>
          <p className="text-sage-500 text-lg">Leia atentamente os termos de uso antes de utilizar nosso site</p>
        </motion.div>
        <section className="space-y-8">
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaGavel className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">1. Aceitação dos Termos</h2>
            </div>
            <p className="text-sage-800">Ao acessar o site Modas Saraí, você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis.</p>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">2. Uso do Site</h2>
            </div>
            <p className="text-sage-800">Você se compromete a utilizar o site apenas para fins legais e de acordo com estes termos. É proibido utilizar o site para fins ilícitos ou que possam prejudicar terceiros.</p>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaFileContract className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">3. Propriedade Intelectual</h2>
            </div>
            <p className="text-sage-800">Todo o conteúdo do site, incluindo textos, imagens, marcas e logotipos, é protegido por direitos autorais e não pode ser utilizado sem autorização prévia.</p>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">4. Limitação de Responsabilidade</h2>
            </div>
            <p className="text-sage-800">Não nos responsabilizamos por danos decorrentes do uso ou da impossibilidade de uso do site, incluindo eventuais falhas técnicas ou indisponibilidade.</p>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaUserShield className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">5. Alterações nos Termos</h2>
            </div>
            <p className="text-sage-800">Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após a publicação no site.</p>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaBalanceScale className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">6. Contato</h2>
            </div>
            <p className="text-sage-800">Em caso de dúvidas sobre os Termos de Uso, entre em contato pelo e-mail <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-primary-600 hover:text-primary-700 hover:underline transition-colors">{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</a>.</p>
          </motion.div>
        </section>
      </div>
    </div>
  );
} 