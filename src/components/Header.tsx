'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, List, X, MagnifyingGlass, Truck, UserPlus, EnvelopeSimple, SignOut, UserCircle, Receipt, Heart } from 'phosphor-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import SidebarCart from './SidebarCart'
import SidebarFavorites from './SidebarFavorites'
import { useAuth } from '@/contexts/AuthContext';
export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { state: cartState, isCartSidebarOpen, setIsCartSidebarOpen } = useCart()
  const { state: favoritesState, isFavoritesSidebarOpen, setIsFavoritesSidebarOpen } = useFavorites()
  const { user, authenticated, logout } = useAuth();
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearching(true)
      window.location.href = `/pesquisa?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }
  const clearSearch = () => {
    setSearchQuery('')
  }
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  useEffect(() => {
    const isMobile = window.innerWidth < 1024
    if (isMobile && isMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isMenuOpen])
  const menuItems = [
    { label: 'Início', href: '/' },
    { label: 'Novidades', href: '/produtos?novidades=true' },
    { label: 'Vestidos', href: '/produtos?categoria=vestidos' },
    { label: 'Conjuntos', href: '/produtos?categoria=conjuntos' },
    { label: 'Acessórios', href: '/produtos?categoria=acessorios' },
  ]
  return (
    <header className="fixed top-0 w-full z-50">
      <div className="bg-sand-100 shadow-sm border-b border-cloud-100/30 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative flex items-center justify-between h-20">
            <motion.a
              href="/"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center cursor-pointer group relative z-10"
              title="Maria Pistache - Ir para a página inicial"
            >
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="Maria Pistache"
                  fill
                  sizes="(max-width: 640px) 48px, 64px"
                  className="object-contain filter brightness-110"
                  priority
                />
              </div>
            </motion.a>
            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-10">
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              >
                <div
                  className={`relative flex items-center bg-white border-2 border-primary-500 rounded-full px-4 py-2.5 transition-all duration-300 shadow-sm ${
                    isSearchFocused ? 'ring-2 ring-primary-300 shadow-md shadow-primary-200 border-primary-500' : ''
                  }`}
                >
                  <MagnifyingGlass 
                    size={20} 
                    weight="regular" 
                    className="text-sage-600 mr-3 flex-shrink-0" 
                  />
                  <input
                    type="text"
                    placeholder="Buscar produtos, vestidos, acessórios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="flex-1 bg-transparent text-sage-900 placeholder-sage-600 focus:outline-none text-sm w-full"
                  />
                  {searchQuery && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={clearSearch}
                      className="ml-2 text-sage-400 hover:text-sage-700 transition-colors p-1 rounded-full hover:bg-cloud-100"
                    >
                      <X size={16} weight="bold" />
                    </motion.button>
                  )}
                </div>
              </motion.form>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 text-sage-700 hover:text-primary-600 transition-all duration-300 hidden sm:flex"
                title="Rastrear Pedido"
                onClick={() => router.push('/rastreio')}
              >
                <Truck size={20} weight="regular" className="relative z-10" />
              </motion.button>
              
              <AnimatePresence>
                {favoritesState.itemCount > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFavoritesSidebarOpen(true)}
                    className="relative p-2.5 sm:p-3 rounded-xl transition-all duration-300 group bg-white/50 hover:bg-white border border-cloud-200 hover:border-primary-300 shadow-sm hover:shadow-md"
                    title="Favoritos"
                  >
                    <Heart size={20} weight="fill" className="relative z-10 text-sage-700 group-hover:text-primary-600" />
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white z-20"
                    >
                      {favoritesState.itemCount}
                    </motion.span>
                  </motion.button>
                )}
              </AnimatePresence>
              
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartSidebarOpen(true)}
                className="relative p-3 bg-transparent text-sage-600 hover:text-primary-600 rounded-2xl transition-all duration-300 group"
                title="Carrinho"
              >
                <ShoppingCart size={22} weight="regular" className="relative z-10" />
                {cartState.itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white z-20"
                  >
                    {cartState.itemCount}
                  </motion.span>
                )}
              </motion.button>
              
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 group overflow-hidden bg-primary-500 text-white shadow-md hover:shadow-lg"
                  title="Minha Conta"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  id="user-menu-trigger"
                >
                  <User size={18} weight="regular" className="relative z-10" />
                  <span className="relative z-10 font-medium text-sm hidden sm:inline">
                    {authenticated && user 
                      ? (() => {
                          const displayName = user.display_name?.trim();
                          const userName = user.name?.trim();
                          if (displayName && displayName !== '' && displayName !== '[Dados protegidos]') {
                            return displayName;
                          }
                          if (userName && userName !== '' && userName !== 'Usuário' && userName !== '[Dados protegidos]') {
                            return userName.split(' ')[0];
                          }
                          return 'Conta';
                        })()
                      : 'Conta'}
                  </span>
                </motion.button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      ref={userMenuRef}
                      className="absolute z-50 min-w-[260px] bg-white rounded-2xl shadow-xl py-3 mt-2 border border-cloud-100"
                      style={{ right: 0, top: '100%' }}
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {authenticated && user ? (
                        <>
                          <div className="px-5 py-3 text-sage-900 font-semibold flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                              <User size={20} className="text-primary-600" weight="regular" />
                            </div>
                            <div>
                              <p className="text-sm">
                                {(() => {
                                  const displayName = user.display_name?.trim();
                                  const userName = user.name?.trim();
                                  if (displayName && displayName !== '' && displayName !== '[Dados protegidos]') {
                                    return `Olá, ${displayName}!`;
                                  }
                                  if (userName && userName !== '' && userName !== 'Usuário' && userName !== '[Dados protegidos]') {
                                    return `Olá, ${userName.split(' ')[0]}!`;
                                  }
                                  if (user.email && user.email !== 'email@exemplo.com') {
                                    return `Olá, ${user.email.split('@')[0]}!`;
                                  }
                                  return 'Olá, Usuário!';
                                })()}
                              </p>
                              <p className="text-xs text-sage-600 font-normal">{user.email}</p>
                            </div>
                          </div>
                          <div className="border-t border-cloud-100 my-2 mx-2"></div>
                          <div className="py-2">
                            <a href="/meus-pedidos" className="group flex items-center gap-3 px-5 py-3 text-sage-800 hover:bg-primary-50 hover:text-primary-600 transition-colors rounded-lg mx-2">
                              <Receipt size={18} className="text-sage-600 group-hover:text-primary-600 transition-colors" weight="regular" />
                              <span className="text-sm">Meus Pedidos</span>
                            </a>
                            <a href="/rastreio" className="group flex items-center gap-3 px-5 py-3 text-sage-800 hover:bg-primary-50 hover:text-primary-600 transition-colors rounded-lg mx-2">
                              <Truck size={18} className="text-sage-600 group-hover:text-primary-600 transition-colors" weight="regular" />
                              <span className="text-sm">Rastrear Pedido</span>
                            </a>
                            <a href="/contato" className="group flex items-center gap-3 px-5 py-3 text-sage-800 hover:bg-primary-50 hover:text-primary-600 transition-colors rounded-lg mx-2">
                              <EnvelopeSimple size={18} className="text-sage-600 group-hover:text-primary-600 transition-colors" weight="regular" />
                              <span className="text-sm">Contato</span>
                            </a>
                            {user.is_admin && (
                              <>
                                <div className="border-t border-cloud-100 my-2 mx-2"></div>
                                <a href="/admin" className="group flex items-center gap-3 px-5 py-3 text-sage-800 hover:bg-primary-50 hover:text-primary-600 transition-colors rounded-lg mx-2">
                                  <div className="w-6 h-6 bg-primary-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">A</span>
                                  </div>
                                  <span className="text-sm">Dashboard Admin</span>
                                </a>
                              </>
                            )}
                          </div>
                          <div className="border-t border-cloud-100 my-2 mx-2"></div>
                          <div className="pt-2 px-2 pb-2">
                            <button
                              onClick={async () => { 
                                await logout(); 
                                setUserMenuOpen(false);
                                if (pathname.startsWith('/admin')) {
                                  router.push('/');
                                } else {
                                  router.refresh();
                                }
                              }}
                              className="group w-full flex items-center gap-3 px-5 py-3 text-sage-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg"
                            >
                              <SignOut size={18} className="text-sage-600 group-hover:text-red-600 transition-colors" weight="regular" />
                              <span className="text-sm">Sair</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <a href="/login" className={`group flex items-center gap-3 px-5 py-3 transition-colors rounded-lg mx-2 ${
                            pathname === '/login' 
                          ? 'bg-primary-50 text-primary-600 font-medium' 
                              : 'text-sage-800 hover:bg-primary-50 hover:text-primary-600'
                          }`}>
                            <User size={18} className={`transition-colors ${
                              pathname === '/login' 
                                ? 'text-primary-600' 
                                : 'text-sage-600 group-hover:text-primary-600'
                            }`} weight="regular" />
                            <span className="text-sm">Fazer Login</span>
                          </a>
                          <a href="/criar-conta" className={`group flex items-center gap-3 px-5 py-3 transition-colors rounded-lg mx-2 ${
                            pathname === '/criar-conta' 
                              ? 'bg-primary-50 text-primary-600 font-medium' 
                              : 'text-sage-800 hover:bg-primary-50 hover:text-primary-600'
                          }`}>
                            <UserPlus size={18} className={`transition-colors ${
                              pathname === '/criar-conta' 
                                ? 'text-primary-600' 
                                : 'text-sage-600 group-hover:text-primary-600'
                            }`} weight="regular" />
                            <span className="text-sm">Criar Conta</span>
                          </a>
                          <div className="border-t border-cloud-100 my-2 mx-2"></div>
                          <a href="/contato" className={`group flex items-center gap-3 px-5 py-3 transition-colors rounded-lg mx-2 ${
                            pathname === '/contato' 
                            ? 'bg-primary-50 text-primary-600 font-medium' 
                            : 'text-sage-800 hover:bg-primary-50 hover:text-primary-600'
                          }`}>
                            <EnvelopeSimple size={18} className={`transition-colors ${
                              pathname === '/contato' 
                                ? 'text-primary-600' 
                                : 'text-sage-600 group-hover:text-primary-600'
                            }`} weight="regular" />
                            <span className="text-sm">Contato</span>
                          </a>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden p-2.5 sm:p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {isMenuOpen ? (
                  <X size={20} weight="bold" />
                ) : (
                  <List size={20} weight="regular" />
                )}
              </motion.button>
            </div>
          </div>

          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <div
                className={`relative flex items-center bg-white border-2 border-primary-500 rounded-full px-4 py-3 transition-all duration-300 shadow-sm ${
                  isSearchFocused ? 'ring-2 ring-primary-300 shadow-md shadow-primary-200 border-primary-500' : ''
                }`}
              >
                <MagnifyingGlass 
                  size={20} 
                  weight="regular" 
                  className="text-sage-600 mr-3 flex-shrink-0" 
                />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  className="flex-1 bg-transparent text-sage-900 placeholder-sage-600 focus:outline-none text-sm"
                  />
                {searchQuery && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={clearSearch}
                    className="ml-2 text-sage-400 hover:text-sage-700 transition-colors p-1 rounded-full hover:bg-cloud-100"
                  >
                    <X size={16} weight="bold" />
                  </motion.button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div 
        className="bg-primary-500 relative z-40"
      >
        <div className="container mx-auto px-4">
          <nav className="hidden lg:flex items-center justify-center gap-2 py-4">
            {menuItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2, scale: 1.05 }}
                className="relative px-6 py-2.5 text-sand-100 font-medium text-sm uppercase tracking-wide rounded-xl group overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-sand-100/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                  initial={false}
                />
                <motion.div
                  className="absolute bottom-1 left-1/2 h-[2px] w-10 sm:w-16 bg-sand-100 rounded-full opacity-0 group-hover:opacity-100 -translate-x-1/2"
                  initial={{ scaleX: 0, originX: 0.5 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                  style={{ transformOrigin: 'center' }}
                />
                <span className="relative z-10 block transition-all duration-300 group-hover:font-semibold">
                  {item.label}
                </span>
              </motion.a>
            ))}
          </nav>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[99] lg:hidden bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 z-[100] lg:hidden w-full max-w-sm bg-sand-100 shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-cloud-200/40">
                  <div className="relative w-20 h-20">
                    <Image
                      src="/images/logo.png"
                      alt="Maria Pistache"
                      fill
                      sizes="80px"
                      className="object-contain"
                      priority
                    />
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-full bg-cloud-100 hover:bg-cloud-200 text-sage-700 hover:text-sage-900 transition-colors"
                  >
                    <X size={24} weight="bold" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-6 py-8">
                  <nav className="space-y-3">
                    {menuItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block px-6 py-4 text-sage-900 font-semibold text-lg uppercase tracking-wide rounded-xl bg-white border border-cloud-200/50 hover:bg-primary-50 hover:border-primary-200/50 hover:text-primary-700 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="flex items-center justify-between">
                          <span>{item.label}</span>
                          <FontAwesomeIcon icon={faChevronRight} size="sm" className="text-sage-400" />
                        </span>
                      </a>
                    ))}
                  </nav>
                </div>

                {authenticated && user && (
                  <div className="px-6 pb-8 pt-4 border-t border-cloud-200/40 space-y-3">
                    <div className="flex items-center gap-3 px-5 py-3 bg-white border border-cloud-200/50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                        <UserCircle size={24} className="text-primary-600" weight="fill" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sage-900 font-semibold text-sm truncate">
                          {(() => {
                            const displayName = user.display_name?.trim();
                            const userName = user.name?.trim();
                            if (displayName && displayName !== '' && displayName !== '[Dados protegidos]') {
                              return displayName;
                            }
                            if (userName && userName !== '' && userName !== 'Usuário' && userName !== '[Dados protegidos]') {
                              return userName.split(' ')[0];
                            }
                            return 'Usuário';
                          })()}
                        </p>
                        <p className="text-sage-600 text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await logout()
                        setIsMenuOpen(false)
                        if (pathname.startsWith('/admin')) {
                          router.push('/');
                        } else {
                          router.refresh();
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold hover:bg-red-100 hover:border-red-300 transition-colors"
                    >
                      <SignOut size={18} weight="bold" />
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <SidebarCart open={isCartSidebarOpen} onClose={() => setIsCartSidebarOpen(false)} />
      <SidebarFavorites open={isFavoritesSidebarOpen} onClose={() => setIsFavoritesSidebarOpen(false)} />
    </header>
  )
}
