"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartLine,
  FaBell,
  FaSearch,
  FaHome,
  FaLayerGroup,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/login');
    }
  }, [authenticated, loading, router]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading && authenticated && user) {
        try {
          const response = await fetch('/api/admin/verificar-status');
          const data = await response.json();
          if (data.success && data.dbIsAdmin) {
            setIsAdminUser(true);
          } else {
            router.replace('/404');
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar status de admin:', error);
          router.replace('/404');
          return;
        } finally {
          setCheckingAdmin(false);
        }
      } else if (!loading && !authenticated) {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [loading, authenticated, user, router]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 border-r-primary-500/50 rounded-full animate-spin"></div>
          <div className="absolute inset-3 border-4 border-transparent border-b-primary-400 border-l-primary-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-6 border-2 border-transparent border-t-primary-500 border-r-primary-500/50 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
        </div>
      </div>
    );
  }
  if (!authenticated) {
    return null;
  }
  if (!isAdminUser) {
    return null;
  }
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  const menuCategories = [
    {
      title: 'Principal',
      items: [
        { href: '/admin', icon: FaTachometerAlt, label: 'Dashboard' },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { href: '/admin/produtos', icon: FaBox, label: 'Produtos' },
        { href: '/admin/modelos', icon: FaLayerGroup, label: 'Modelos' },
      ]
    },
    {
      title: 'Vendas',
      items: [
        { href: '/admin/pedidos', icon: FaShoppingCart, label: 'Pedidos' },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { href: '/admin/usuarios', icon: FaUsers, label: 'Usuários' },
      ]
    },
  ];
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 }
  };
  const overlayVariants = {
    open: { opacity: 1, visibility: 'visible' as const },
    closed: { opacity: 0, visibility: 'hidden' as const }
  };
  return (
    <div className="min-h-screen bg-primary-50 flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-sage-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      <motion.div 
        className={`hidden lg:flex lg:flex-col bg-primary-50 border-r border-primary-100 shadow-lg transition-all duration-300 ${
          sidebarExpanded ? 'w-64 xl:w-72' : 'w-20'
        }`}
        initial={false}
        animate={{ width: sidebarExpanded ? 256 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className={`flex items-center h-16 bg-primary-50 border-b border-primary-100 relative ${sidebarExpanded ? 'justify-center px-4 lg:px-6' : 'justify-center px-2'}`}>
          {sidebarExpanded ? (
            <>
              <div className="flex items-center justify-center">
                <div className="relative w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="Maria Pistache"
                    fill
                    sizes="(max-width: 1024px) 40px, 48px"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="absolute right-4 p-2 text-sage-600 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-all duration-300 flex-shrink-0"
                title="Retrair sidebar"
              >
                <FaArrowLeft size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="relative w-10 h-10 flex-shrink-0 mx-auto">
                <Image
                  src="/images/logo.png"
                  alt="Maria Pistache"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="p-2 text-sage-600 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-all duration-300 flex-shrink-0 mt-2"
                title="Expandir sidebar"
              >
                <FaArrowRight size={16} />
              </button>
            </>
          )}
        </div>
        <nav className={`flex-1 py-4 space-y-4 overflow-y-auto transition-all duration-300 ${sidebarExpanded ? 'px-4' : 'px-2'}`}>
          {menuCategories.map((category, categoryIndex) => (
            <div key={category.title} className="space-y-2">
              {sidebarExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: categoryIndex * 0.05 }}
                  className="px-3 mb-2"
                >
                  <div className="text-xs font-semibold text-sage-600 uppercase tracking-wider">{category.title}</div>
                </motion.div>
              )}
              {category.items.map((item, itemIndex) => {
                const globalIndex = categoryIndex * 10 + itemIndex;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: globalIndex * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`group relative flex items-center transition-all duration-300 rounded-lg border overflow-hidden ${
                        sidebarExpanded ? 'px-3 py-2.5' : 'px-2 py-2.5 justify-center'
                      } ${
                        pathname === item.href
                          ? 'text-primary-600 bg-primary-100 border-primary-500'
                          : 'text-sage-700 hover:text-primary-600 border-transparent hover:border-primary-200 hover:bg-primary-50'
                      }`}
                      title={!sidebarExpanded ? item.label : undefined}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className={`w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300 border border-primary-200 group-hover:border-primary-300 ${
                        sidebarExpanded ? 'mr-3' : 'mr-0'
                      }`}>
                        <item.icon className={`${pathname === item.href ? 'text-primary-600' : 'text-primary-500'} group-hover:text-primary-600 transition-colors duration-300`} size={16} />
                      </div>
                      <span className={`font-medium text-sm transition-all duration-300 whitespace-nowrap ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </nav>
        <div className={`py-4 border-t border-primary-100 transition-all duration-300 ${sidebarExpanded ? 'px-4' : 'px-2'}`}>
          {sidebarExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-3 mb-3"
            >
              <div className="text-xs font-semibold text-sage-600 uppercase tracking-wider">Usuário</div>
            </motion.div>
          )}
          <div className={`px-3 py-2.5 bg-white rounded-lg border border-primary-100 relative ${sidebarExpanded ? '' : 'flex justify-center'}`}>
            {sidebarExpanded && (
              <button
                onClick={handleLogout}
                className="absolute top-2 right-2 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 rounded-lg"
                title="Sair"
              >
                <FaSignOutAlt size={14} />
              </button>
            )}
            <div className={`flex items-center gap-3 ${sidebarExpanded ? 'pr-8' : ''}`}>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border border-primary-300 flex-shrink-0">
                <span className="text-primary-600 font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              {sidebarExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <div className="text-sm font-medium text-sage-900 truncate">{user?.name}</div>
                  <div className="text-xs text-sage-600 truncate">{user?.email}</div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-primary-50 border-r border-primary-100 shadow-2xl lg:hidden flex flex-col"
      >
        <div className="flex items-center justify-between h-16 px-6 bg-primary-50 border-b border-primary-100">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Maria Pistache"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sage-700 hover:text-sage-900 transition-colors p-2 rounded-lg hover:bg-primary-100"
          >
            <FaTimes size={18} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {menuCategories.map((category, categoryIndex) => (
            <div key={category.title} className="space-y-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: categoryIndex * 0.05 }}
                className="px-3 mb-2"
              >
                <div className="text-xs font-semibold text-sage-600 uppercase tracking-wider">{category.title}</div>
              </motion.div>
              {category.items.map((item, itemIndex) => {
                const globalIndex = categoryIndex * 10 + itemIndex;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: globalIndex * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`group relative flex items-center px-3 py-2.5 transition-all duration-300 rounded-lg border overflow-hidden ${
                        pathname === item.href
                          ? 'text-primary-600 bg-primary-100 border-primary-500'
                          : 'text-sage-700 hover:text-primary-600 border-transparent hover:border-primary-200 hover:bg-primary-50'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mr-3 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300 border border-primary-200 group-hover:border-primary-300">
                        <item.icon className={`${pathname === item.href ? 'text-primary-600' : 'text-primary-500'} group-hover:text-primary-600 transition-colors duration-300`} size={16} />
                      </div>
                      <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-primary-100">
          <div className="px-3 mb-3">
            <div className="text-xs font-semibold text-sage-600 uppercase tracking-wider">Usuário</div>
          </div>
          <div className="px-3 py-2.5 bg-white rounded-lg border border-primary-100 relative">
            <button
              onClick={handleLogout}
              className="absolute top-2 right-2 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 rounded-lg"
              title="Sair"
            >
              <FaSignOutAlt size={14} />
            </button>
            <div className="flex items-center gap-3 pr-8">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border border-primary-300">
                <span className="text-primary-600 font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sage-900 truncate">{user?.name}</div>
                <div className="text-xs text-sage-600 truncate">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border-b border-primary-100 h-16 flex items-center justify-between px-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-sage-700 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-primary-50"
            >
              <FaBars size={18} />
            </button>
            <div className="hidden md:flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sage-700 text-sm font-medium">Painel Administrativo</span>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-300 rounded-lg border border-primary-200 hover:border-primary-300"
            >
              <FaHome size={16} />
              <span className="text-sm font-medium">Voltar ao Site</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-56 bg-white border border-primary-100 rounded-lg px-3 py-2 pl-9 text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-300 focus:bg-white transition-all duration-300 text-sm"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-500" size={14} />
            </div>
            <button className="relative p-2 text-sage-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
              <FaBell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-sage-900">Bem-vindo, {user?.name?.split(' ')[0]}</div>
                <div className="text-xs text-sage-600">Administrador</div>
              </div>
              <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center border border-primary-300">
                <span className="text-primary-600 font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 p-4 lg:p-6 bg-primary-50 overflow-auto max-w-full"
        >
          <div className="max-w-full overflow-hidden">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
