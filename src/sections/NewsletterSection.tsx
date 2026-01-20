'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'

export function NewsletterSection() {
    return (
        <section className="relative py-32 bg-black overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-white rounded-full blur-[120px] opacity-10 animate-pulse duration-[10s]" />
                <div className="absolute bottom-[-50%] right-[-20%] w-[600px] h-[600px] bg-gray-200 rounded-full blur-[100px] opacity-10" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                            Esteja sempre <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                                à frente das tendências.
                            </span>
                        </h2>
                        <p className="text-gray-400 mb-12 text-lg max-w-2xl mx-auto font-light">
                            Inscreva-se em nossa newsletter e receba acesso antecipado a lançamentos,
                            eventos exclusivos e ofertas especiais.
                        </p>

                        <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                            <div className="flex-1 relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-gray-500/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative flex items-center bg-black rounded-lg">
                                    <Mail className="absolute left-4 text-gray-500" size={20} strokeWidth={1.5} />
                                    <input
                                        type="email"
                                        placeholder="Seu melhor e-mail"
                                        className="w-full bg-white/5 border border-white/20 text-white placeholder-gray-400 py-4 pl-12 pr-4 rounded-lg focus:ring-1 focus:ring-white/50 focus:border-white/50 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="bg-white text-black font-bold py-4 px-8 rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                Cadastrar
                                <ArrowRight size={18} strokeWidth={2} />
                            </button>
                        </form>
                        <p className="text-xs text-gray-600 mt-8 font-light tracking-wide">
                            Respeitamos sua privacidade. Cancele quando quiser.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
