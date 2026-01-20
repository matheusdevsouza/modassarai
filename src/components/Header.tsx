'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, User, Heart, ShoppingBag, List, X, SignIn, UserPlus, EnvelopeSimple, SignOut, Receipt } from 'phosphor-react'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { state: cartState } = useCart()
  const cartCount = cartState.itemCount
  const { state: favoritesState } = useFavorites()
  const { authenticated, user, logout } = useAuth()

  // Search Typing Animation
  const placeholders = ["Vestidos", "Calças Jeans", "Blusas", "Acessórios", "Sapatos"]
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % placeholders.length
      const fullText = placeholders[i]

      setDisplayText(isDeleting
        ? fullText.substring(0, displayText.length - 1)
        : fullText.substring(0, displayText.length + 1)
      )

      setTypingSpeed(isDeleting ? 50 : 150)

      if (!isDeleting && displayText === fullText) {
        setTimeout(() => setIsDeleting(true), 1500)
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [displayText, isDeleting, loopNum, typingSpeed, placeholders])

  const categories = [
    { name: 'NOVIDADES', href: '/produtos?sort=newest', highlight: false },
    { name: 'FEMININO', href: '/produtos?categoria=feminino', highlight: false },
    { name: 'JEANS', href: '/produtos?categoria=jeans', highlight: false },
    { name: 'VESTIDOS', href: '/produtos?categoria=vestidos', highlight: false },
    { name: 'OFERTAS', href: '/produtos?ofertas=true', highlight: true },
  ]

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm' : 'bg-white'}`}>
        {/* Main Header Content */}
        <div className="container mx-auto px-4 border-b border-gray-100">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-black"
            >
              <List size={24} />
            </button>

            {/* Logo */}
            <Link href="/" className="relative w-32 h-10 flex-shrink-0 mx-auto lg:mx-0">
              <Image
                src="/images/logo.png"
                alt="Modas Saraí"
                fill
                className="object-contain" // Changed to contain to ensure it fits well
                priority
              />
            </Link>

            {/* Centralized Search Bar - Advanced Typing */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8 relative">
              <div className={`relative w-full group transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
                <input
                  type="text"
                  placeholder={`Buscar por ${displayText}`}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full h-11 pl-12 pr-4 bg-white border border-gray-300 rounded-full text-sm outline-none focus:border-black transition-all placeholder-gray-500"
                />
                <MagnifyingGlass
                  size={18}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-black' : 'text-gray-400'}`}
                />
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1 sm:gap-2 -mr-2">
              <div className="relative group z-50">
                <Link href={authenticated ? "/conta" : "/login"} className="p-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-full transition-colors hidden sm:flex flex-col items-center gap-0.5" onClick={(e) => authenticated ? null : e.preventDefault()}>
                  <User size={20} />
                  <span className="text-[10px] font-medium hidden sm:block group-hover:font-bold">
                    {authenticated ? 'Conta' : 'Entrar'}
                  </span>
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 w-56 bg-white shadow-xl rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 border border-gray-100 mt-2 z-50">
                  <div className="absolute top-0 right-4 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45 -translate-y-1/2"></div>

                  {authenticated ? (
                    // Logged In State
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-500">Olá, {user?.name?.split(' ')[0]}</p>
                      </div>
                      <Link href="/conta" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        <User size={18} />
                        Minha Conta
                      </Link>
                      <Link href="/conta/pedidos" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        <Receipt size={18} />
                        Meus Pedidos
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <SignOut size={18} />
                        Sair
                      </button>
                    </>
                  ) : (
                    // Logged Out State
                    <>
                      <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        <SignIn size={18} />
                        Fazer Login
                      </Link>
                      <Link href="/criar-conta" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        <UserPlus size={18} />
                        Criar Conta
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <Link href="/contato" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        <EnvelopeSimple size={18} />
                        Contato
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('openFavorites'))}
                className="p-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-full transition-colors flex flex-col items-center gap-0.5 group relative"
              >
                <Heart size={20} />
                <span className="text-[10px] font-medium hidden sm:block group-hover:font-bold">Favoritos</span>
                {favoritesState.itemCount > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 bg-black rounded-full border border-white"></span>
                )}
              </button>
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('openCart'))}
                className="p-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-full transition-colors flex flex-col items-center gap-0.5 group relative"
              >
                <ShoppingBag size={20} />
                <span className="text-[10px] font-medium hidden sm:block group-hover:font-bold">Sacola</span>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-1 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation - Centered */}
        <div className="hidden lg:block border-b border-gray-100">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-center gap-10 h-14">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={`text-xs font-bold tracking-widest transition-colors relative group py-5 ${cat.highlight ? 'text-red-600 hover:text-red-700' : 'text-gray-800 hover:text-black'}`}
                >
                  {cat.name}
                  <span className={`absolute bottom-0 left-0 w-full h-[3px] transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${cat.highlight ? 'bg-red-600' : 'bg-black'}`} />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header - Adjusted for smaller height without marquee */}
      <div className="h-[136px]"></div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
              className="absolute top-0 left-0 h-full w-[80%] max-w-sm bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="O que você procura?"
                    className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-black"
                  />
                  <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <nav className="flex flex-col space-y-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`py-3 border-b border-gray-50 text-sm font-bold ${cat.highlight ? 'text-red-600' : 'text-gray-800'}`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
