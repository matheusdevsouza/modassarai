'use client'
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube, FaWhatsapp, FaPhoneAlt, FaEnvelope, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
interface FAQItemProps {
  faq: { pergunta: string; resposta: string };
  index: number;
}
const FAQItem = ({ faq, index }: FAQItemProps) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + (index * 0.05), duration: 0.4 }}
      className={`overflow-hidden rounded-xl bg-primary-50 relative transition-all duration-300 ${
        open ? 'border-2 border-primary-500 border-l-4' : 'border-2 border-primary-100'
      }`}
    >
      <button
        type="button"
        className={`w-full flex items-center justify-between px-5 py-4 cursor-pointer text-base font-semibold select-none transition-all duration-300 ${open ? 'text-primary-600' : 'text-sage-900'} focus:outline-none`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{faq.pergunta}</span>
        <motion.span 
          className={`ml-4 transition-all duration-300 text-primary-600`}
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
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
};
const ContatoSkeleton = () => (
  <div className="min-h-screen bg-sand-100 pt-48 pb-12 px-4 md:px-0">
    <div className="max-w-5xl mx-auto flex flex-col gap-10">
      <div className="mb-2">
        <div className="h-12 bg-cloud-100 rounded-lg mx-auto max-w-md mb-4"></div>
        <div className="h-6 bg-cloud-100 rounded-md mx-auto max-w-lg"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center bg-primary-50 rounded-xl p-6 shadow-sm min-w-[240px]">
            <div className="w-7 h-7 bg-cloud-100 rounded-full mb-2"></div>
            <div className="h-6 bg-cloud-100 rounded w-24 mb-1"></div>
            <div className="h-4 bg-cloud-100 rounded w-32 mb-1"></div>
            <div className="h-5 bg-cloud-100 rounded w-28 mt-1"></div>
          </div>
        ))}
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="h-6 bg-cloud-100 rounded w-48 mb-4"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl bg-primary-50 shadow-sm">
              <div className="w-full flex items-center justify-between px-5 py-4">
                <div className="h-5 bg-cloud-100 rounded w-3/4"></div>
                <div className="w-5 h-5 bg-cloud-100 rounded"></div>
              </div>
            </div>
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
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  const faqs = [
    { pergunta: 'Quais são os horários de atendimento?', resposta: 'Nosso atendimento é de segunda a sexta, das 9h às 18h, exceto feriados.' },
    { pergunta: 'Como acompanho meu pedido?', resposta: 'Você pode acompanhar seu pedido acessando sua conta ou pelo link de rastreamento enviado por e-mail.' },
    { pergunta: 'Quais formas de contato posso usar?', resposta: 'Você pode falar conosco por WhatsApp, e-mail ou telefone. Todos os canais estão disponíveis nesta página.' },
    { pergunta: 'Posso retirar o produto na loja física?', resposta: 'Atualmente trabalhamos apenas com vendas online e entregas em todo o Brasil.' },
    { pergunta: 'Como faço para trocar ou devolver um produto?', resposta: 'Acesse a seção de Trocas e Devoluções ou entre em contato pelo formulário abaixo.' },
    { pergunta: 'Vocês vendem para atacado?', resposta: 'Sim! Entre em contato pelo WhatsApp para condições especiais para lojistas.' },
    { pergunta: 'Quais formas de pagamento são aceitas?', resposta: 'Aceitamos cartões de crédito, débito, Pix e boleto bancário.' },
    { pergunta: 'Como funciona o frete?', resposta: 'O valor do frete é calculado automaticamente no checkout, de acordo com seu CEP.' },
    { pergunta: 'Posso alterar meu endereço após a compra?', resposta: 'Entre em contato o quanto antes para tentarmos alterar antes do envio.' },
    { pergunta: 'Recebi um produto com defeito, o que faço?', resposta: 'Entre em contato imediatamente para solucionarmos o problema o mais rápido possível.' },
  ]
  if (loading) {
    return <ContatoSkeleton />;
  }
  return (
    <div className="min-h-screen bg-sand-100 pt-48 pb-12 px-4 md:px-0">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-sage-900 mb-4">Central de Atendimento</h1>
          <p className="text-sage-800 text-lg">Tem alguma dúvida? Entre em contato, estamos aqui para te ajudar!</p>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-8 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="flex flex-col items-center bg-primary-50 rounded-xl p-6 shadow-sm min-w-[240px] max-w-[320px] w-full"
          >
            <FaWhatsapp className="text-primary-600 mb-2" size={28} />
            <span className="font-semibold text-lg text-sage-900 mb-1">WhatsApp</span>
            <span className="text-sage-700 text-sm text-center mb-2">Atendimento rápido</span>
            <a href="https://wa.me/5511974835035" target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm sm:text-base mt-1 hover:text-primary-700 underline-offset-4 transition-colors break-words text-center px-2">+55 11 97483-5035</a>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }} 
            className="flex flex-col items-center bg-primary-50 rounded-xl p-6 shadow-sm min-w-[240px] max-w-[320px] w-full"
          >
            <FaEnvelope className="text-primary-600 mb-2" size={28} />
            <span className="font-semibold text-lg text-sage-900 mb-1">E-mail</span>
            <span className="text-sage-700 text-sm text-center mb-2">Resposta o mais breve possível</span>
            <a 
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} 
              className="text-primary-600 text-sm sm:text-base mt-1 hover:text-primary-700 underline-offset-4 transition-colors break-words text-center px-2"
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            >
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
            </a>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }} 
            className="flex flex-col items-center bg-primary-50 rounded-xl p-6 shadow-sm min-w-[240px] max-w-[320px] w-full"
          >
            <FaPhoneAlt className="text-primary-600 mb-2" size={28} />
            <span className="font-semibold text-lg text-sage-900 mb-1">Telefone</span>
            <span className="text-sage-700 text-sm text-center mb-2">Seg-Sex: 9h às 18h</span>
            <a href="tel:5511974835035" className="text-primary-600 text-sm sm:text-base mt-1 hover:text-primary-700 underline-offset-4 transition-colors break-words text-center px-2">+55 11 97483-5035</a>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }} 
            className="flex flex-col items-center bg-primary-50 rounded-xl p-6 shadow-sm min-w-[240px] max-w-[320px] w-full"
          >
            <FaClock className="text-primary-600 mb-2" size={28} />
            <span className="font-semibold text-lg text-sage-900 mb-1">Horário</span>
            <span className="text-sage-700 text-sm text-center mb-2">Segunda a Sexta</span>
            <span className="text-sage-800 text-base mt-1">9h às 18h</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }} 
            className="flex flex-col items-center bg-primary-50 rounded-xl p-6 shadow-sm min-w-[240px] max-w-[320px] w-full"
          >
            <FaMapMarkerAlt className="text-primary-600 mb-2" size={28} />
            <span className="font-semibold text-lg text-sage-900 mb-1">Endereço</span>
            <span className="text-sage-700 text-sm text-center">Rua João meneghete, 427</span>
            <span className="text-sage-700 text-sm text-center">Jardim três marias</span>
            <span className="text-sage-700 text-sm text-center">Taboão da Serra - SP</span>
            <span className="text-sage-800 text-base mt-1">CEP 06790-100</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.5 }} 
            className="flex flex-col items-center bg-primary-50 rounded-xl p-6 shadow-sm min-w-[240px] max-w-[320px] w-full"
          >
            <FaInstagram className="text-primary-600 mb-2" size={28} />
            <span className="font-semibold text-lg text-sage-900 mb-1">Instagram</span>
            <span className="text-sage-700 text-sm text-center mb-2">Siga-nos nas redes sociais</span>
            <a href="https://www.instagram.com/mariapistacheoficial?igsh=MTA3azFndWFtZXI1bQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm sm:text-base mt-1 hover:text-primary-700 underline-offset-4 transition-colors break-words text-center px-2">@mariapistacheoficial</a>
          </motion.div>
        </div>
        <motion.section 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.1 }} 
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-xl font-semibold mb-4 text-sage-900 text-center">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}