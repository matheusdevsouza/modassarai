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

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      
      const htmlElement = document.documentElement
      const bodyElement = document.body
      
      if (htmlElement) {
        htmlElement.classList.add('lenis-stopped')
      }
      
      bodyElement.style.position = 'fixed'
      bodyElement.style.top = `-${scrollY}px`
      bodyElement.style.width = '100%'
      bodyElement.style.overflow = 'hidden'
      
      return () => {
        if (htmlElement) {
          htmlElement.classList.remove('lenis-stopped')
        }
        
        bodyElement.style.position = ''
        bodyElement.style.top = ''
        bodyElement.style.width = ''
        bodyElement.style.overflow = ''
        
        window.scrollTo(0, scrollY)
      }
    }
  }, [open])

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
            className="fixed top-0 right-0 h-full w-full md:w-[70vw] max-w-4xl z-[200] bg-sage-50 border-l border-cloud-100 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-cloud-100">
              <div className="flex items-center gap-2">
                <Heart size={24} className="text-primary-600" weight="fill" />
                <span className="text-lg font-bold text-sage-900">Meus Favoritos</span>
                {state.itemCount > 0 && (
                  <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {state.itemCount}
                  </span>
                )}
              </div>
              <button 
                onClick={onClose} 
                className="text-sage-700 hover:text-primary-600 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
              {state.items.length === 0 ? (
                <div className="text-center text-sage-700 mt-16">
                  <Heart size={48} className="mx-auto mb-4 opacity-40 text-sage-400" weight="regular" />
                  <p className="text-lg mb-2 font-semibold">Seus favoritos estão vazios</p>
                  <p className="text-sm text-sage-600">Adicione produtos que você ama aos favoritos!</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.items.map(favorite => {
                      const sizes = getAvailableSizes(favorite.product.id)
                      const currentSize = favorite.size

                      return (
                        <motion.div
                          key={favorite.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="bg-white border border-cloud-100 rounded-xl p-4 hover:border-primary-300 transition-all shadow-sm relative group"
                        >
                          <button
                            onClick={() => removeFavorite(favorite.id)}
                            className="absolute top-2 right-2 p-1.5 bg-cloud-100 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                            title="Remover dos favoritos"
                          >
                            <Trash size={16} />
                          </button>

                          <Link 
                            href={`/produto/${favorite.product.slug || favorite.product.id}`}
                            onClick={onClose}
                            className="relative w-full h-48 rounded-lg overflow-hidden bg-sand-100 mb-3 block"
                          >
                            <Image
                              src={favorite.image || favorite.product.image || '/images/Logo.png'}
                              alt={favorite.product.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </Link>

                          <div className="space-y-2">
                            <Link 
                              href={`/produto/${favorite.product.slug || favorite.product.id}`}
                              onClick={onClose}
                              className="block"
                            >
                              <h3 className="font-semibold text-sage-900 text-sm hover:text-primary-600 transition-colors break-words line-clamp-2">
                                {favorite.product.name}
                              </h3>
                            </Link>
                            
                            <div className="text-primary-600 font-bold text-base">
                              R$ {favorite.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>

                            {(currentSize || favorite.color) && (
                              <div className="text-xs text-sage-700 flex items-center gap-1.5 flex-wrap">
                                {currentSize && (
                                  <span className="px-2 py-0.5 bg-cloud-100 rounded-md">
                                    <span className="font-semibold">{currentSize}</span>
                                  </span>
                                )}
                                {favorite.color && (
                                  <span className="px-2 py-0.5 bg-cloud-100 rounded-md">
                                    <span className="font-semibold">{favorite.color}</span>
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleAddToCart(favorite)}
                                disabled={Boolean(
                                  (productHasSizes(favorite.product.id) && (!currentSize || currentSize.trim() === '' || currentSize === 'Selecione')) ||
                                  (currentSize && productSizes[favorite.product.id] && productSizes[favorite.product.id].length > 0 && !isSizeAvailable(favorite.product.id, currentSize))
                                )}
                                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                title={
                                  (productHasSizes(favorite.product.id) && (!currentSize || currentSize.trim() === '' || currentSize === 'Selecione'))
                                    ? 'Selecione um tamanho'
                                    : (currentSize && productSizes[favorite.product.id] && productSizes[favorite.product.id].length > 0 && !isSizeAvailable(favorite.product.id, currentSize))
                                      ? 'Tamanho esgotado'
                                      : 'Adicionar ao carrinho'
                                }
                              >
                                <ShoppingCart size={16} />
                                <span>Adicionar</span>
                              </button>
                              <Link
                                href={`/produto/${favorite.product.slug || favorite.product.id}`}
                                onClick={onClose}
                                className="px-3 py-2 bg-cloud-100 hover:bg-cloud-200 text-sage-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                                title="Ver produto na loja"
                              >
                                <Eye size={16} />
                                <span>Ver</span>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {state.items.length > 0 && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover todos os favoritos?')) {
                            clearFavorites()
                          }
                        }}
                        className="py-2 px-6 rounded-xl bg-cloud-100 text-sage-800 hover:bg-sage-200 transition-colors text-sm"
                      >
                        Limpar Todos os Favoritos
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
                  
            {state.items.length > 0 && (
              <div className="border-t border-cloud-100 px-6 py-4 bg-white">
                <div className="text-center text-sm text-sage-700">
                  <p className="font-semibold">
                    {state.itemCount} {state.itemCount === 1 ? 'item favoritado' : 'itens favoritados'}
                  </p>
                  <p className="text-xs mt-1 text-sage-600">
                    Clique em &quot;Ver&quot; para ver detalhes do produto
                  </p>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
