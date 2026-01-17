'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Target, Heart, Eye, Sparkle, CheckCircle } from 'phosphor-react'

const MissionValuesVisionSkeleton = () => (
  <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden" style={{
    backgroundColor: '#1A1816',
    backgroundImage: `
      linear-gradient(rgba(196, 151, 105, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(196, 151, 105, 0.06) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px'
  }}>
    <div className="container mx-auto px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
      <div className="text-center mb-12 md:mb-16 space-y-6">
        <div className="h-5 w-40 bg-white/10 rounded-full mx-auto animate-pulse" />
        <div className="h-12 md:h-16 w-full max-w-3xl bg-white/10 rounded-lg mx-auto animate-pulse" />
        <div className="h-6 w-full max-w-2xl bg-white/5 rounded-lg mx-auto animate-pulse" />
        <div className="h-px w-32 bg-white/10 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative h-full bg-white/5 rounded-2xl p-10 md:p-12 border border-white/10">
            <div className="flex flex-col h-full items-center text-center space-y-6">
              <div className="w-10 h-10 bg-white/10 rounded animate-pulse" />
              <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-px w-20 bg-white/10 animate-pulse" />
              <div className="space-y-3 w-full max-w-md">
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse mx-auto" />
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse mx-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export function MissionValuesVisionSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const cards = [
    {
      icon: Target,
      title: 'Missão',
      description: (
        <>
          Oferecer moda feminina contemporânea e sofisticada. Nossa missão é vestir mulheres que buscam expressar sua personalidade com <span className="text-primary-400 font-semibold">conforto e elegância atemporal</span>.
        </>
      ),
    },
    {
      icon: Heart,
      title: 'Valores',
      description: (
        <ul className="space-y-4 text-left">
          <li className="flex items-start gap-3">
            <CheckCircle size={20} weight="fill" className="text-primary-400 flex-shrink-0 mt-0.5" />
            <span>Autenticidade e Qualidade</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={20} weight="fill" className="text-primary-400 flex-shrink-0 mt-0.5" />
            <span>Sustentabilidade e Inclusão</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={20} weight="fill" className="text-primary-400 flex-shrink-0 mt-0.5" />
            <span>Moda Consciente</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={20} weight="fill" className="text-primary-400 flex-shrink-0 mt-0.5" />
            <span>Respeito às Pessoas</span>
          </li>
        </ul>
      ),
    },
    {
      icon: Eye,
      title: 'Visão',
      description: (
        <>
          Ser referência nacional em moda feminina, reconhecida pela <span className="text-primary-400 font-semibold">inovação</span> e <span className="text-primary-400 font-semibold">compromisso genuíno</span> com a satisfação, criando conexões duradouras que celebram a beleza única.
        </>
      ),
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-24 md:py-32 overflow-hidden"
      style={{
        backgroundColor: '#1A1816',
        backgroundImage: `
          linear-gradient(rgba(196, 151, 105, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(196, 151, 105, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-12 md:mb-16 relative"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-20 inline-flex items-center gap-2 justify-center text-xs uppercase tracking-[0.2em] text-white/60 mb-4 font-medium px-4 py-1.5 rounded-full border border-white/20 bg-white/5"
          >
            <Sparkle size={12} weight="fill" className="text-white/50" />
            sobre a marca
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-20 text-4xl md:text-5xl lg:text-6xl font-bold text-sand-100 mb-6 leading-tight"
          >
            Nossa{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary-400 via-primary-300 to-primary-400 bg-clip-text text-transparent">
                essência
              </span>
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? {
                  width: ['0%', '100%', '100%', '0%', '0%']
                } : { width: 0 }}
                transition={{
                  duration: 12,
                  delay: 0.8,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                  times: [0, 0.08, 0.5, 0.58, 1]
                }}
                className="absolute bottom-2 left-0 h-3 bg-primary-400/20 -z-0"
                style={{ transform: 'skewX(-12deg)' }}
              />
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative z-20 text-lg md:text-xl text-sand-200/60 max-w-3xl mx-auto leading-relaxed"
          >
            Conheça os pilares que guiam a Modas Saraí e definem nossa identidade como marca de moda feminina.
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: '120px' } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mx-auto mt-8 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent"
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'visible'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto"
        >
          {cards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <motion.div
                key={card.title}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="group relative"
              >
                <div className="relative h-full bg-white/5 rounded-3xl p-8 md:p-10 border border-white/10 group-hover:border-primary-400/40 transition-all duration-500 backdrop-blur-sm">
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-6 flex justify-center">
                      <IconComponent
                        size={52}
                        weight="thin"
                        className="text-primary-400"
                      />
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center tracking-wide uppercase" style={{ letterSpacing: '0.05em' }}>
                      {card.title}
                    </h3>

                    <div className="flex-1">
                      {card.title === 'Valores' ? (
                        <div className="text-sm md:text-base text-white/90 font-normal leading-relaxed">
                          {card.description}
                        </div>
                      ) : (
                        <p className="text-sm md:text-base text-white/90 font-normal leading-relaxed text-center">
                          {card.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

