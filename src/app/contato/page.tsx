'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEnvelope,
  faChevronDown,
  faClock,
  faLocationDot,
  faPhone,
  faHeadset
} from '@fortawesome/free-solid-svg-icons'
import {
  faWhatsapp,
  faInstagram,
  faTiktok
} from '@fortawesome/free-brands-svg-icons'

interface FAQItemProps {
  faq: { pergunta: string; resposta: string };
  index: number;
}

const FAQItem = ({ faq, index }: FAQItemProps) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + (index * 0.03), duration: 0.4 }}
      className={`overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm relative transition-all duration-300 ${open ? 'border-2 border-primary-400 shadow-md' : 'border border-sage-300'}`}
    >
      <button
        type="button"
        className={`w-full flex items-center justify-between px-5 py-4 cursor-pointer text-left text-base font-semibold select-none transition-all duration-300 ${open ? 'text-primary-600' : 'text-sage-900'} focus:outline-none`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{faq.pergunta}</span>
        <motion.span
          className="ml-4 text-sage-400"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: 'easeInOut' },
              opacity: { duration: 0.2, ease: 'easeInOut' }
            }}
            className="overflow-hidden border-t border-sage-200/50"
          >
            <p className="px-5 py-4 text-sage-600 text-sm leading-relaxed">{faq.resposta}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ContatoSkeleton = () => (
  <div className="min-h-screen bg-sand-100 pt-48 pb-12 px-4 md:px-0">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="h-10 bg-cloud-100 rounded-lg mx-auto max-w-sm mb-4 animate-pulse"></div>
        <div className="h-5 bg-cloud-100 rounded-md mx-auto max-w-lg animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-cloud-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="lg:col-span-2 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-cloud-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function Contato() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const faqs = [
    { pergunta: 'Quais são os horários de atendimento?', resposta: 'Nosso atendimento é de segunda a sexta, das 9h às 18h, exceto feriados.' },
    { pergunta: 'Como acompanho meu pedido?', resposta: 'Você pode acompanhar seu pedido acessando sua conta ou pelo link de rastreamento enviado por e-mail.' },
    { pergunta: 'Quais formas de contato posso usar?', resposta: 'Você pode falar conosco por WhatsApp, e-mail ou telefone. Todos os canais estão disponíveis nesta página.' },
    { pergunta: 'Posso retirar o produto na loja física?', resposta: 'Atualmente trabalhamos apenas com vendas online e entregas em todo o Brasil.' },
    { pergunta: 'Como faço para trocar ou devolver um produto?', resposta: 'Entre em contato pelo WhatsApp informando o número do pedido e o motivo da troca ou devolução.' },
    { pergunta: 'Vocês vendem para atacado?', resposta: 'Sim! Entre em contato pelo WhatsApp para condições especiais para lojistas.' },
    { pergunta: 'Quais formas de pagamento são aceitas?', resposta: 'Aceitamos cartões de crédito, débito, Pix e boleto bancário.' },
    { pergunta: 'Como funciona o frete?', resposta: 'O valor do frete é calculado automaticamente no checkout, de acordo com seu CEP. Enviamos para todo o Brasil.' },
    { pergunta: 'Posso alterar meu endereço após a compra?', resposta: 'Entre em contato o quanto antes para tentarmos alterar antes do envio.' },
    { pergunta: 'Recebi um produto com defeito, o que faço?', resposta: 'Entre em contato imediatamente com fotos do produto. Solucionaremos o problema o mais rápido possível.' },
  ]

  if (loading) {
    return <ContatoSkeleton />;
  }

  const contactMethods = [
    {
      icon: faWhatsapp,
      title: 'WhatsApp',
      description: 'Atendimento rápido',
      value: '+55 11 93005-5418',
      href: 'https://wa.me/5511930055418?text=Olá! Gostaria de saber mais sobre os produtos da Modas Saraí.',
      color: 'bg-primary-500',
      external: true
    },
    {
      icon: faEnvelope,
      title: 'E-mail',
      description: 'Resposta em até 24h',
      value: 'contato@modassarai.com.br',
      href: 'mailto:contato@modassarai.com.br',
      color: 'bg-primary-500',
      external: false
    },
    {
      icon: faInstagram,
      title: 'Instagram',
      description: 'Siga-nos',
      value: '@modassarai',
      href: 'https://instagram.com/modassarai',
      color: 'bg-primary-400',
      external: true
    },
    {
      icon: faTiktok,
      title: 'TikTok',
      description: 'Nos acompanhe',
      value: '@modassarai',
      href: 'https://tiktok.com/@modassarai',
      color: 'bg-sage-800',
      external: true
    }
  ]

  return (
    <div className="min-h-screen bg-sand-100 pt-48 pb-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 border border-sage-300/50 rounded-full bg-sage-100/50">
            <FontAwesomeIcon icon={faHeadset} className="text-sage-400 text-sm w-4 h-4" />
            <span className="text-xs uppercase tracking-[0.2em] text-sage-500 font-medium">
              Central de Atendimento
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-sage-900 mb-4">
            Como podemos{' '}
            <span className="bg-gradient-to-r from-primary-500 via-primary-700 to-primary-500 bg-clip-text text-transparent">
              ajudar?
            </span>
          </h1>
          <p className="text-sage-500 text-lg max-w-xl mx-auto">
            Escolha o canal de sua preferência ou encontre sua resposta nas perguntas frequentes.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Contact Methods */}
          <div className="lg:col-span-1 space-y-4">
            {contactMethods.map((method, index) => (
              <motion.a
                key={method.title}
                href={method.href}
                target={method.external ? '_blank' : undefined}
                rel={method.external ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-sage-200/60 hover:border-primary-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <FontAwesomeIcon icon={method.icon} className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sage-900 group-hover:text-primary-600 transition-colors">{method.title}</p>
                  <p className="text-xs text-sage-500">{method.description}</p>
                  <p className="text-sm text-primary-600 truncate">{method.value}</p>
                </div>
              </motion.a>
            ))}

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-sage-200/60"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-sage-200 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-sage-600" />
                </div>
                <div>
                  <p className="font-medium text-sage-900 text-sm">Horário de Atendimento</p>
                  <p className="text-xs text-sage-600">Seg - Sex, 9h às 18h</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-200 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-sage-600" />
                </div>
                <div>
                  <p className="font-medium text-sage-900 text-sm">Localização</p>
                  <p className="text-xs text-sage-600">Taboão da Serra - SP</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: FAQ */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-sage-900 mb-4">Perguntas Frequentes</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FAQItem key={i} faq={faq} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}