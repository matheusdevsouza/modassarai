'use client'
import { useState, useRef, useEffect, Fragment } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  Package
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { AnimatePresence, motion } from 'framer-motion'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [placeholder, setPlaceholder] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)

  const { user, logout } = useAuth()
  const { state: cartState, setIsCartSidebarOpen } = useCart()
  const { state: favoritesState, setIsFavoritesSidebarOpen } = useFavorites()
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const cartCount = cartState?.itemCount || 0
  const favoritesCount = favoritesState?.itemCount || 0

  // Search Typing Effect
  const searchPhrases = ["Vestidos", "Calças Jeans", "Blusas Elegantes", "Acessórios", "Sapatos"]

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % searchPhrases.length
      const fullText = searchPhrases[i]

      setPlaceholder(isDeleting
        ? fullText.substring(0, placeholder.length - 1)
        : fullText.substring(0, placeholder.length + 1)
      )

      setTypingSpeed(isDeleting ? 30 : 150)

      if (!isDeleting && placeholder === fullText) {
        setTimeout(() => setIsDeleting(true), 1500)
      } else if (isDeleting && placeholder === '') {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [placeholder, isDeleting, loopNum, typingSpeed, searchPhrases])

  // Close user menu on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/produtos?busca=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navigation = [
    { name: 'Novidades', href: '/produtos?sort=newest' },
    { name: 'Feminino', href: '/produtos?categoria=feminino' },
    { name: 'Masculino', href: '/produtos?categoria=masculino' },
    { name: 'Infantil', href: '/produtos?categoria=infantil' },
    { name: 'Jeans', href: '/produtos?categoria=jeans' },
    { name: 'Acessórios', href: '/produtos?categoria=acessorios' },
    { name: 'Sale', href: '/produtos?promocao=true', highlight: true },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm font-sans">
      {/* Static Top Bar */}
      <div className="bg-[#222] text-white py-2 flex justify-center items-center relative z-20">
        <p className="text-[10px] sm:text-[11px] font-bold tracking-tight text-center w-full">
          Frete Grátis para todo Brasil • Parcelamento em até 10x sem juros
        </p>
      </div>

      <div className="container mx-auto px-4 pb-0 pt-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2 text-[#333333]"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Logo - Left Aligned on Desktop */}
          <Link href="/" className="relative w-32 h-8 sm:w-40 sm:h-10 flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="Luxúria Modas"
              fill
              className="object-contain object-left md:object-center lg:object-left"
              priority
            />
          </Link>

          {/* Search Bar - Centered */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="w-full relative group">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Buscar por ${placeholder}|`}
                className="w-full bg-[#F4F4F4] border-none rounded-full py-2.5 pl-5 pr-12 text-sm text-[#333333] placeholder-gray-400 focus:ring-1 focus:ring-gray-200 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black rounded-full text-white hover:bg-[#333] transition-colors"
              >
                <Search size={16} strokeWidth={2} />
              </button>
            </form>
          </div>

          {/* Actions - Right Aligned */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Trigger */}
            <button className="md:hidden p-2 text-[#333333]">
              <Search size={22} strokeWidth={1.5} />
            </button>

            <div className="relative user-menu-container">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 text-[#333333] hover:bg-gray-100 rounded-full transition-colors"
              >
                <User size={22} strokeWidth={1.5} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 py-1 divide-y divide-gray-100"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3">
                          <p className="text-sm text-gray-900 font-medium truncate">Olá, {user.name.split(' ')[0]}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link href="/minha-conta" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <User size={16} className="mr-3 text-gray-400 group-hover:text-black" /> Minha Conta
                          </Link>
                          <Link href="/minha-conta/pedidos" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Package size={16} className="mr-3 text-gray-400 group-hover:text-black" /> Meus Pedidos
                          </Link>
                        </div>
                        <div className="py-1">
                          <button onClick={logout} className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                            <LogOut size={16} className="mr-3 text-red-400 group-hover:text-red-600" /> Sair
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-1">
                        <Link href="/login" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <LogIn size={16} className="mr-3 text-gray-400 group-hover:text-black" /> Entrar
                        </Link>
                        <Link href="/criar-conta" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <UserPlus size={16} className="mr-3 text-gray-400 group-hover:text-black" /> Criar Conta
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsFavoritesSidebarOpen(true)}
              className="relative p-2 text-[#333333] hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
            >
              <Heart size={22} strokeWidth={1.5} />
              {favoritesCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              className="relative p-2 text-[#333333] hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsCartSidebarOpen(true)}
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation - Bottom Row - Centered */}
        <div className="hidden lg:flex items-center justify-center gap-8 border-t border-gray-100 py-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-black ${item.highlight ? 'text-red-600' : 'text-[#666666]'
                }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-50 shadow-xl overflow-y-auto"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-lg font-bold">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-gray-500">
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block py-3 px-4 rounded-lg text-base font-medium ${item.highlight
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsFavoritesSidebarOpen(true);
                    }}
                    className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <Heart size={20} /> Meus Favoritos
                    {favoritesCount > 0 && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{favoritesCount}</span>}
                  </button>
                  <Link
                    href="/minha-conta/pedidos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <Package size={20} /> Meus Pedidos
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
