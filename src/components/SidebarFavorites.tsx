'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, ShoppingCart, Eye, Trash } from 'phosphor-react'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useCart } from '@/contexts/CartContext'

interface SidebarFavoritesProps {
  open: boolean
  onClose: () => void
}

export default function SidebarFavorites({ open, onClose }: SidebarFavoritesProps) {
  const { state, removeFavorite, clearFavorites } = useFavorites()
  const { addItem } = useCart()
  const [productSizes, setProductSizes] = useState<{ [key: string]: any[] }>({})
  const [loadingSizes, setLoadingSizes] = useState<{ [key: string]: boolean }>({})
  const loadProductSizes = async (productId: string, slug?: string) => {
    if (!slug) return
    if (productSizes[productId] || loadingSizes[productId]) return

    setLoadingSizes(prev => ({ ...prev, [productId]: true }))
    try {
      const response = await fetch(`/api/products/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setProductSizes(prev => ({
          ...prev,
          [productId]: data.sizes || []
        }))
      }
    } catch (error) {

    } finally {
      setLoadingSizes(prev => ({ ...prev, [productId]: false }))
    }
  }



  const productHasSizes = (productId: string): boolean => {
    const sizes = productSizes[productId] || []
    return sizes.length > 0
  }

  const handleAddToCart = (favorite: any) => {
    const size = favorite.size
    const color = favorite.color
    const image = favorite.image || favorite.product.image || '/images/Logo.png'
    
    if (productHasSizes(favorite.product.id)) {
      if (!size || size.trim() === '' || size === 'Selecione') {
        alert('Por favor, selecione um tamanho antes de adicionar ao carrinho.')
        return
      }
    }
    
    addItem(favorite.product, 1, size, color, image)
    
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const isSizeAvailable = (productId: string, size: string): boolean => {
    const sizes = productSizes[productId] || []
    if (sizes.length === 0) return true
    const sizeData = sizes.find((s: any) => 
      (typeof s === 'string' ? s : s.size) === size
    )
    if (!sizeData) return false
    if (typeof sizeData === 'string') return true
    return sizeData.available && sizeData.stock > 0
  }

  const getSizeStock = (productId: string, size: string): number => {
    const sizes = productSizes[productId] || []
    const sizeData = sizes.find((s: any) => 
      (typeof s === 'string' ? s : s.size) === size
    )
    if (!sizeData) return 0
    if (typeof sizeData === 'string') return 999 
    return sizeData.stock || 0
  }

  const getAvailableSizes = (productId: string): string[] => {
    const sizes = productSizes[productId] || []
    return sizes
      .filter((s: any) => {
        if (typeof s === 'string') return true
        return s.available && s.stock > 0
      })
      .map((s: any) => typeof s === 'string' ? s : s.size)
  }

  useEffect(() => {
    if (state.items.length === 0) return
    
    state.items.forEach(favorite => {
      const slug = favorite.product.slug || favorite.product.id
      if (slug && typeof slug === 'string') {
        if (!productSizes[favorite.product.id] && !loadingSizes[favorite.product.id]) {
          loadProductSizes(favorite.product.id, slug)
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.items.length, open]) 

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199]"
          />
          
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-[200] bg-[#0D0D0D] border-l border-dark-700 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-dark-700">
              <div className="flex items-center gap-2">
                <Heart size={20} className="sm:w-6 sm:h-6 text-primary-400" weight="fill" />
                <span className="text-base sm:text-lg font-bold text-white">Meus Favoritos</span>
                {state.itemCount > 0 && (
                  <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {state.itemCount}
                  </span>
                )}
              </div>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-primary-400 transition-colors p-1"
              >
                <X size={24} className="sm:w-7 sm:h-7" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {state.items.length === 0 ? (
                <div className="text-center text-gray-400 mt-16">
                  <Heart size={48} className="mx-auto mb-4 opacity-40" weight="regular" />
                  <p className="text-lg mb-2">Seus favoritos estão vazios</p>
                  <p className="text-sm">Adicione produtos que você ama aos favoritos!</p>
                </div>
              ) : (
                <>
                  <ul className="space-y-4">
                    {state.items.map(favorite => {
                      const sizes = getAvailableSizes(favorite.product.id)
                      const currentSize = favorite.size

                      return (
                        <li 
                          key={favorite.id} 
                          className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-3 sm:p-4 hover:border-primary-500/30 transition-all relative flex flex-col sm:flex-row gap-3 sm:gap-4 min-h-[140px] sm:min-h-0"
                        >
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1.5 sm:gap-2 z-10">
                            <button
                              onClick={() => removeFavorite(favorite.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors backdrop-blur-sm touch-manipulation"
                              title="Remover dos favoritos"
                            >
                              <Trash size={16} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>

                          <div className="flex gap-3 sm:gap-4 w-full">
                            <Link 
                              href={`/produto/${favorite.product.slug || favorite.product.id}`}
                              onClick={onClose}
                              className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-dark-800 group"
                            >
                              <Image
                                src={favorite.image || favorite.product.image || '/images/Logo.png'}
                                alt={favorite.product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 96px, 128px"
                              />
                            </Link>

                            <div className="flex-1 min-w-0 pr-14 sm:pr-16 flex flex-col">
                              <Link 
                                href={`/produto/${favorite.product.slug || favorite.product.id}`}
                                onClick={onClose}
                                className="block"
                              >
                                <h3 className="font-semibold text-sm sm:text-base text-white truncate mb-1 hover:text-primary-400 transition-colors">
                                  {favorite.product.name}
                                </h3>
                              </Link>
                              
                              <div className="text-primary-400 font-bold text-sm sm:text-base mb-2">
                                R$ {favorite.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>

                              <div className="space-y-1 mb-2 sm:mb-3">
                                {(currentSize || favorite.color) && (
                                  <div className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                                    {currentSize && (
                                      <span>
                                        Tamanho: <span className="text-white font-medium">{currentSize}</span>
                                      </span>
                                    )}
                                    {favorite.color && (
                                      <span>
                                        Cor: <span className="text-white font-medium">{favorite.color}</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-auto">
                                <button
                                    onClick={() => handleAddToCart(favorite)}
                                    disabled={Boolean(
                                      (productHasSizes(favorite.product.id) && (!currentSize || currentSize.trim() === '' || currentSize === 'Selecione')) ||
                                      (currentSize && productSizes[favorite.product.id] && productSizes[favorite.product.id].length > 0 && !isSizeAvailable(favorite.product.id, currentSize))
                                    )}
                                    className="flex-1 bg-primary-500 hover:bg-gradient-to-r hover:from-[var(--logo-gold,#D4A574)] hover:via-[var(--logo-gold-light,#E6B896)] hover:to-[var(--logo-gold,#D4A574)] text-white px-4 py-3 sm:px-3 sm:py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-500 touch-manipulation"
                                    title={
                                      (productHasSizes(favorite.product.id) && (!currentSize || currentSize.trim() === '' || currentSize === 'Selecione'))
                                        ? 'Selecione um tamanho'
                                        : (currentSize && productSizes[favorite.product.id] && productSizes[favorite.product.id].length > 0 && !isSizeAvailable(favorite.product.id, currentSize))
                                          ? 'Tamanho esgotado'
                                          : 'Adicionar ao carrinho'
                                    }
                                  >
                                    <ShoppingCart size={18} className="sm:w-4 sm:h-4" />
                                    <span>Adicionar</span>
                                  </button>
                                  <Link
                                    href={`/produto/${favorite.product.slug || favorite.product.id}`}
                                    onClick={onClose}
                                    className="px-4 py-3 sm:px-3 sm:py-2 bg-dark-700 hover:bg-[#333333] text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation"
                                    title="Ver produto na loja"
                                  >
                                    <Eye size={18} className="sm:w-4 sm:h-4" />
                                    <span>Ver</span>
                                  </Link>
                              </div>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>

                  {state.items.length > 0 && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover todos os favoritos?')) {
                            clearFavorites()
                          }
                        }}
                        className="py-2 px-4 sm:px-6 rounded-xl bg-dark-800 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors text-xs sm:text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
                      >
                        <Trash size={16} />
                        Limpar Todos os Favoritos
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
                
            {state.items.length > 0 && (
              <div className="border-t border-dark-700 px-4 sm:px-6 py-3 sm:py-4 bg-dark-950">
                <div className="text-center text-xs sm:text-sm text-gray-400">
                  <p>{state.itemCount} {state.itemCount === 1 ? 'item favoritado' : 'itens favoritados'}</p>
                  <p className="text-xs mt-1 hidden sm:block">Clique em &quot;Ver&quot; para ver detalhes do produto</p>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

