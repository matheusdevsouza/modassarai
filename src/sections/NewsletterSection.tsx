'use client'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function NewsletterSection() {
    return (
        <section className="bg-gray-100 py-20 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center text-center">
                {/* Logo */}
                <div className="w-48 mb-8 relative opacity-90 grayscale hover:grayscale-0 transition-all duration-500">
                    <Image
                        src="/images/logo.png"
                        alt="Luxúria Modas"
                        width={200}
                        height={60}
                        className="object-contain mx-auto"
                    />
                </div>

                <div className="max-w-xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
                        Junte-se ao Clube
                    </h2>
                    <p className="text-gray-500 font-medium">
                        Acesso exclusivo a lançamentos, pré-vendas e ofertas especiais.
                        Seja o primeiro a saber.
                    </p>

                    <form className="flex flex-col sm:flex-row gap-0 w-full pt-4">
                        <input
                            type="email"
                            placeholder="SEU EMAIL"
                            className="flex-1 bg-transparent border-b-2 border-black text-black placeholder-gray-400 py-3 px-2 focus:outline-none focus:border-gray-500 transition-colors uppercase font-bold text-sm"
                        />
                        <button
                            type="submit"
                            className="bg-black text-white px-8 py-3 uppercase font-bold tracking-widest text-xs hover:bg-gray-800 transition-colors mt-4 sm:mt-0"
                        >
                            Inscrever-se
                        </button>
                    </form>

                    <p className="text-[10px] text-gray-400 uppercase tracking-widest pt-8">
                        Ao se inscrever, você concorda com nossos Termos de Privacidade.
                    </p>
                </div>
            </div>

            {/* Minimalist Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </section>
    )
}
