'use client'
import React, { useState, useEffect } from 'react';
import { FaDatabase, FaEye, FaLock, FaCookieBite, FaEdit, FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';
const PolicySkeleton = () => (
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
export default function PoliticaDePrivacidade() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return <PolicySkeleton />;
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-sage-900 mb-4">Política de Privacidade</h1>
          <p className="text-sage-500 text-lg">Sua privacidade é importante para nós</p>
        </motion.div>
        <section className="space-y-8">
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaDatabase className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">1. Coleta de Informações</h2>
            </div>
            <p className="text-sage-800">Coletamos informações fornecidas por você ao criar uma conta, realizar uma compra ou entrar em contato. Também coletamos dados automaticamente, como endereço IP e informações do navegador, para melhorar sua experiência.</p>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaEye className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">2. Uso das Informações</h2>
            </div>
            <p className="text-sage-800">Utilizamos seus dados para processar pedidos, oferecer suporte, enviar comunicações e melhorar nossos serviços. Não compartilhamos suas informações com terceiros, exceto quando necessário para cumprir obrigações legais ou processar pagamentos.</p>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaLock className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">3. Segurança</h2>
            </div>
            <p className="text-sage-800">Adotamos medidas de segurança para proteger seus dados contra acesso não autorizado, alteração ou divulgação.</p>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaCookieBite className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">4. Cookies</h2>
            </div>
            <p className="text-sage-800">Utilizamos cookies para melhorar a navegação e personalizar sua experiência. Você pode desativar os cookies nas configurações do seu navegador.</p>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaEdit className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">5. Alterações nesta Política</h2>
            </div>
            <p className="text-sage-800">Podemos atualizar esta política periodicamente. Recomendamos que você revise esta página regularmente para estar ciente de eventuais mudanças.</p>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaEnvelope className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">6. Contato</h2>
            </div>
            <p className="text-sage-800">Em caso de dúvidas sobre nossa política de privacidade, entre em contato pelo e-mail <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-primary-600 hover:text-primary-700 hover:underline transition-colors">{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</a>.</p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}