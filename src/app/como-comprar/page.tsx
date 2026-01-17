'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MagnifyingGlass, ShoppingCart, IdentificationCard, CreditCard, Smiley, ArrowRight } from 'phosphor-react';

const ComoComprarSkeleton = () => (
  <div className="min-h-screen bg-sand-100 pt-48 pb-16 px-4 md:px-6">
    <div className="max-w-5xl mx-auto">
      {/* Header skeleton */}
      <div className="text-center mb-16">
        <div className="h-4 w-32 bg-sage-200/50 rounded-full mx-auto mb-6 animate-pulse" />
        <div className="h-10 w-80 bg-sage-200/60 rounded-lg mx-auto mb-4 animate-pulse" />
        <div className="h-5 w-96 max-w-full bg-sage-200/40 rounded-lg mx-auto animate-pulse" />
      </div>

      {/* Steps skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 bg-sage-200/50 rounded-2xl mb-4 animate-pulse" />
            <div className="h-5 w-28 bg-sage-200/60 rounded mb-3 animate-pulse" />
            <div className="space-y-2 w-full">
              <div className="h-3 w-full bg-sage-200/40 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-sage-200/40 rounded mx-auto animate-pulse" />
            </div>
            <div className="w-8 h-8 bg-primary-200/50 rounded-full mt-4 animate-pulse" />
          </div>
        ))}
      </div>

      {/* CTA skeleton */}
      <div className="flex justify-center mt-16">
        <div className="h-14 w-56 bg-primary-200/50 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

const steps = [
  {
    icon: MagnifyingGlass,
    title: 'Encontre seu produto',
    desc: 'Explore as categorias, use filtros e descubra o modelo perfeito para você.'
  },
  {
    icon: ShoppingCart,
    title: 'Adicione ao carrinho',
    desc: 'Escolha tamanho, cor e clique em Adicionar ao carrinho.'
  },
  {
    icon: IdentificationCard,
    title: 'Informe seus dados',
    desc: 'No checkout, preencha seus dados de entrega e escolha o frete.'
  },
  {
    icon: CreditCard,
    title: 'Pague com segurança',
    desc: 'Cartão, Pix ou boleto. Processo 100% seguro.'
  },
  {
    icon: Smiley,
    title: 'Aguarde e aproveite',
    desc: 'Acompanhe a entrega pelo site e receba seu pedido.'
  },
];

export default function ComoComprar() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <ComoComprarSkeleton />;

  return (
    <div className="min-h-screen bg-sand-100 pt-48 pb-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-sage-500 mb-4 font-medium">
            Passo a passo
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-sage-900 mb-4">
            Como Comprar
          </h1>
          <p className="text-sage-500 text-lg max-w-xl mx-auto">
            Veja como é fácil realizar suas compras em nossa loja
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-16">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + (i * 0.08),
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white/50 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[280px]"
              >
                <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center mb-5 group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300">
                  <Icon
                    size={32}
                    weight="duotone"
                    className="text-primary-600 group-hover:text-white transition-colors duration-300"
                  />
                </div>
                <h2 className="text-lg font-semibold text-sage-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                  {step.title}
                </h2>
                <p className="text-sage-500 text-sm leading-relaxed flex-1">
                  {step.desc}
                </p>
                <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center mt-auto pt-0 text-base">
                  {i + 1}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/produtos">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Explorar Produtos
              <ArrowRight size={20} weight="bold" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}