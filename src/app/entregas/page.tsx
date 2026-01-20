'use client'
import React, { useState, useEffect } from 'react';
import { FaTruck, FaMapMarkerAlt, FaClock, FaShieldAlt, FaBox, FaSearch, FaGift, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';
const EntregasSkeleton = () => (
  <div className="min-h-screen bg-sand-100 pt-48 pb-12 px-4 md:px-0">
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <div className="h-12 bg-cloud-100 rounded-lg mx-auto max-w-md mb-4"></div>
        <div className="h-6 bg-cloud-100 rounded-md mx-auto max-w-lg"></div>
      </div>
      <div className="space-y-8">
        {[...Array(5)].map((_, i) => (
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
            {i === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="bg-cloud-50 rounded-lg p-4">
                    <div className="h-5 bg-cloud-100 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-cloud-100 rounded w-full"></div>
                  </div>
                ))}
              </div>
            )}
            {i === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="text-center">
                    <div className="w-16 h-16 bg-cloud-100 rounded-full mx-auto mb-3"></div>
                    <div className="h-5 bg-cloud-100 rounded w-full mb-2"></div>
                    <div className="h-4 bg-cloud-100 rounded w-2/3 mx-auto"></div>
                  </div>
                ))}
              </div>
            )}
            {i === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {[...Array(2)].map((_, j) => (
                  <div key={j}>
                    <div className="h-5 bg-cloud-100 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-cloud-100 rounded w-full"></div>
                  </div>
                ))}
              </div>
            )}
            {i === 3 && (
              <div className="space-y-2 mt-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-cloud-100 rounded w-full"></div>
                ))}
              </div>
            )}
            {i === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j}>
                    <div className="h-5 bg-cloud-100 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-cloud-100 rounded w-full"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);
export default function Entregas() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return <EntregasSkeleton />;
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-sage-900 mb-4">Entregas</h1>
          <p className="text-sage-500 text-lg">Conheça nossas opções de entrega</p>
        </motion.div>
        <section className="space-y-8">
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaGift className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">Frete Grátis</h2>
            </div>
            <p className="text-sage-800 mb-4">
              Oferecemos frete grátis para compras acima de R$ 199 em todo o Brasil.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sage-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary-600 mb-2">Compras acima de R$ 199</h3>
                <p className="text-sage-800 text-sm">Frete grátis para todo o Brasil</p>
              </div>
              <div className="bg-sage-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary-600 mb-2">Compras abaixo de R$ 199</h3>
                <p className="text-sage-800 text-sm">Frete calculado automaticamente</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaSearch className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">Rastreamento</h2>
            </div>
            <p className="text-sage-800 mb-4">
              Acompanhe sua entrega em tempo real através do código de rastreamento enviado por e-mail.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-primary-600 mb-2">Código de Rastreamento</h3>
                <p className="text-sage-800 text-sm">Você receberá o código por e-mail assim que o pedido for enviado.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-600 mb-2">Acompanhamento Online</h3>
                <p className="text-sage-800 text-sm">Acesse sua conta para acompanhar o status do pedido.</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaBox className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">Embalagem e Proteção</h2>
            </div>
            <p className="text-sage-800 mb-4">
              Todos os produtos são embalados com cuidado para garantir que cheguem em perfeitas condições.
            </p>
            <motion.ul
              className="text-sage-800 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <li>• Embalagem resistente e segura</li>
              <li>• Proteção contra impactos e umidade</li>
              <li>• Caixa personalizada da Luxúria Modas</li>
              <li>• Produto lacrado e autenticado</li>
            </motion.ul>
          </motion.div>
          <motion.div
            className="bg-primary-50 rounded-2xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-sage-900">Segurança na Entrega</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h3 className="text-lg font-semibold text-primary-600 mb-2">Assinatura Obrigatória</h3>
                <p className="text-sage-800 text-sm">Todas as entregas requerem assinatura do destinatário para maior segurança.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h3 className="text-lg font-semibold text-primary-600 mb-2">Seguro de Transporte</h3>
                <p className="text-sage-800 text-sm">Todos os produtos são segurados durante o transporte.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <h3 className="text-lg font-semibold text-primary-600 mb-2">Verificação na Entrega</h3>
                <p className="text-sage-800 text-sm">Sempre verifique a embalagem antes de assinar o recebimento.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <h3 className="text-lg font-semibold text-primary-600 mb-2">Suporte 24/7</h3>
                <p className="text-sage-800 text-sm">Em caso de problemas, entre em contato conosco imediatamente.</p>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}