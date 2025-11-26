'use client'
import React, { useState, useEffect } from 'react';
import { FaSearch, FaShoppingCart, FaRegAddressCard, FaCreditCard, FaSmile } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';
const ComoComprarSkeleton = () => (
  <div className="min-h-screen bg-sand-100 pt-48 pb-12 px-4 md:px-0">
    <div className="max-w-6xl mx-auto flex flex-col gap-12">
      <div className="text-center">
        <div className="h-12 bg-cloud-100 rounded-lg mx-auto max-w-md mb-4"></div>
        <div className="h-6 bg-cloud-100 rounded-md mx-auto max-w-lg"></div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-4 justify-center items-stretch w-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="group bg-primary-50 rounded-2xl flex-1 flex flex-col items-center p-6 shadow-sm">
            <div className="w-12 h-12 bg-cloud-100 rounded-full mb-3"></div>
            <div className="h-6 bg-cloud-100 rounded w-3/4 mb-2"></div>
            <div className="space-y-2 w-full">
              <div className="h-4 bg-cloud-100 rounded w-full"></div>
              <div className="h-4 bg-cloud-100 rounded w-5/6"></div>
              <div className="h-4 bg-cloud-100 rounded w-4/5"></div>
            </div>
            <div className="mt-auto pt-4 w-8 h-8 bg-cloud-100 rounded"></div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-6 mt-10">
        <div className="h-14 bg-cloud-100 rounded-2xl w-64"></div>
      </div>
    </div>
  </div>
);
const steps = [
  {
    icon: <FaSearch size={36} className="text-primary-600" />, title: 'Encontre seu produto',
    desc: 'Explore as categorias, use filtros e descubra o modelo perfeito para você.'
  },
  {
    icon: <FaShoppingCart size={36} className="text-primary-600" />, title: 'Adicione ao carrinho',
    desc: 'Escolha tamanho, cor e clique em Adicionar ao carrinho. Continue comprando ou vá para o carrinho.'
  },
  {
    icon: <FaRegAddressCard size={36} className="text-primary-600" />, title: 'Informe seus dados',
    desc: 'No checkout, preencha seus dados de entrega e escolha a forma de envio.'
  },
  {
    icon: <FaCreditCard size={36} className="text-primary-600" />, title: 'Pague com segurança',
    desc: 'Selecione o método de pagamento: cartão, Pix ou boleto. Processo 100% seguro.'
  },
  {
    icon: <FaSmile size={36} className="text-primary-600" />, title: 'Aguarde e aproveite',
    desc: 'Você receberá um e-mail com os detalhes e poderá acompanhar a entrega pelo site.'
  },
];
export default function ComoComprar() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return <ComoComprarSkeleton />;
  }
  return (
    <div className="min-h-screen bg-sand-100 pt-48 pb-12 px-4 md:px-0">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-sage-900 mb-4">Como Comprar</h1>
          <p className="text-sage-800 text-lg">Veja como realizar suas compras em nossa loja:</p>
        </motion.div>
        <div className="flex flex-col md:flex-row gap-6 md:gap-4 justify-center items-stretch w-full">
          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              className="group bg-primary-50 rounded-2xl flex-1 flex flex-col items-center p-6 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.1 + (i * 0.1),
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className="mb-3"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.2 + (i * 0.1),
                  type: "spring",
                  stiffness: 200
                }}
              >
                {step.icon}
              </motion.div>
              <h2 className="text-lg font-bold text-sage-900 mb-2 group-hover:text-primary-600 transition-colors duration-300 text-center">{step.title}</h2>
              <p className="text-sage-800 text-sm text-center">{step.desc}</p>
              <motion.div 
                className="mt-auto pt-4 text-primary-600 font-bold text-xl"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.3 + (i * 0.1),
                  type: "spring",
                  stiffness: 300
                }}
              >
                {i + 1}
              </motion.div>
            </motion.div>
          ))}
        </div>
        <motion.div 
          className="flex flex-col items-center gap-6 mt-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/produtos" className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300">
              Conheça nossos produtos
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}