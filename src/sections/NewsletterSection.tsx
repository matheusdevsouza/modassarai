'use client'
import { motion } from 'framer-motion'
import { EnvelopeSimple, ArrowRight } from 'phosphor-react'

export function NewsletterSection() {
    return (
        <section className="py-20 bg-black text-white px-4">
            <div className="container mx-auto max-w-4xl text-center">
                <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4">
                    Fique por dentro
                </h2>
                <p className="text-gray-400 mb-10 text-lg">
                    Cadastre-se para receber novidades, ofertas exclusivas e muito estilo.
                </p>

                <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                    <div className="relative flex-1 group">
                        <EnvelopeSimple size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" />
                        <input
                            type="email"
                            placeholder="Seu e-mail aqui"
                            className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-500 py-4 pl-14 pr-6 rounded-full focus:outline-none focus:border-white/50 focus:bg-black transition-all"
                        />
                    </div>
                    <button type="submit" className="bg-white text-black font-bold uppercase tracking-wider py-4 px-10 rounded-full hover:bg-gray-200 hover:scale-105 transition-all duration-300 shadow-xl shadow-white/5">
                        Cadastrar
                    </button>
                </form>
            </div>
        </section>
    )
}
