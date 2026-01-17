'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle } from 'react-icons/fa';
const FAQSkeleton = () => (
  <div className="min-h-screen bg-sand-100 pt-48 pb-12 px-4 md:px-0">
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <div className="h-12 bg-cloud-100 rounded-lg mx-auto max-w-md mb-4"></div>
        <div className="h-6 bg-cloud-100 rounded-md mx-auto max-w-lg"></div>
      </div>
      <div className="space-y-4">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl bg-primary-50 border-2 border-primary-100">
            <div className="w-full flex items-center justify-between px-5 py-4">
              <div className="h-5 bg-cloud-100 rounded w-3/4"></div>
              <div className="w-5 h-5 bg-cloud-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <div className="bg-sage-50 rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 bg-cloud-100 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-cloud-100 rounded w-48 mx-auto mb-4"></div>
          <div className="space-y-2 mb-6">
            <div className="h-4 bg-cloud-100 rounded w-full"></div>
            <div className="h-4 bg-cloud-100 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="h-12 bg-cloud-100 rounded-lg w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
);
export default function FAQ() {
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<number[]>([]);
  const faqs = [
    { pergunta: 'Quais são os horários de atendimento?', resposta: 'Nosso atendimento é de segunda a sexta, das 9h às 18h, exceto feriados.' },
    { pergunta: 'Como acompanho meu pedido?', resposta: 'Você pode acompanhar seu pedido acessando sua conta ou pelo link de rastreamento enviado por e-mail.' },
    { pergunta: 'Quais formas de contato posso usar?', resposta: 'Você pode falar conosco por WhatsApp, e-mail ou telefone. Todos os canais estão disponíveis na página de contato.' },
    { pergunta: 'Posso retirar o produto na loja física?', resposta: 'Atualmente trabalhamos apenas com vendas online e entregas em todo o Brasil.' },
    { pergunta: 'Como faço para trocar ou devolver um produto?', resposta: 'Acesse a seção de Trocas e Devoluções ou entre em contato pelo formulário de contato.' },
    { pergunta: 'Vocês vendem para atacado?', resposta: 'Sim! Entre em contato pelo WhatsApp para condições especiais para lojistas.' },
    { pergunta: 'Quais formas de pagamento são aceitas?', resposta: 'Aceitamos cartões de crédito, débito, Pix e boleto bancário.' },
    { pergunta: 'Como funciona o frete?', resposta: 'O valor do frete é calculado automaticamente no checkout, de acordo com seu CEP. Oferecemos frete grátis para compras acima de R$ 199.' },
    { pergunta: 'Posso alterar meu endereço após a compra?', resposta: 'Entre em contato o quanto antes para tentarmos alterar antes do envio.' },
    { pergunta: 'Recebi um produto com defeito, o que faço?', resposta: 'Entre em contato imediatamente para solucionarmos o problema o mais rápido possível.' },
    { pergunta: 'Qual a política de troca de produtos?', resposta: 'Oferecemos troca gratuita em até 30 dias após o recebimento do produto, desde que esteja em perfeitas condições de uso.' },
    { pergunta: 'Como funciona o rastreamento da entrega?', resposta: 'Você receberá um código de rastreamento por e-mail assim que o pedido for enviado. Acompanhe em tempo real pelo site.' },
    { pergunta: 'Os produtos têm garantia?', resposta: 'Sim, todos os nossos produtos possuem garantia de 30 dias.' },
    { pergunta: 'Posso parcelar no cartão?', resposta: 'Sim! Oferecemos parcelamento em até 12x sem juros no cartão de crédito.' },
  ];
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };
  if (loading) {
    return <FAQSkeleton />;
  }
  return (
    <div className="min-h-screen bg-sand-100 pt-48 pb-12 px-4 md:px-0">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 text-left">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-sage-900 mb-4">Perguntas Frequentes</h1>
          <p className="text-sage-500 text-lg">Encontre respostas para as principais dúvidas sobre nossos produtos e serviços</p>
        </motion.div>
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4 text-left"
        >
          {faqs.map((faq, i) => {
            const isOpen = openItems.includes(i);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.05), duration: 0.4 }}
                className={`overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm relative transition-all duration-300 ${isOpen ? 'border-2 border-primary-400 shadow-md' : 'border border-sage-300'
                  }`}
              >
                <button
                  type="button"
                  className={`w-full flex items-center justify-between px-5 py-4 cursor-pointer text-base font-semibold select-none transition-all duration-300 ${isOpen ? 'text-primary-600' : 'text-sage-900'} focus:outline-none text-left`}
                  onClick={() => toggleItem(i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-left flex-1">{faq.pergunta}</span>
                  <motion.span
                    className={`ml-4 flex-shrink-0 transition-all duration-300 text-primary-600`}
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.3, ease: 'easeInOut' },
                        opacity: { duration: 0.2, ease: 'easeInOut' }
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-1">
                        <p className="text-sage-700 text-sm leading-relaxed">{faq.resposta}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.section>
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-primary-50 rounded-2xl p-8 shadow-sm">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <FaQuestionCircle className="text-transparent bg-clip-text bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 mx-auto mb-4" size={48} style={{ fill: 'url(#gradient)' }} />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C49769" />
                    <stop offset="100%" stopColor="#A67B4E" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
            <h2 className="text-xl font-semibold text-sage-900 mb-4">Ainda tem dúvidas?</h2>
            <p className="text-sage-800 mb-6">
              Se não encontrou a resposta que procurava, entre em contato conosco.
              Nossa equipe está pronta para ajudar!
            </p>
            <motion.a
              href="/contato"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Entrar em Contato
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}