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

      if (htmlElement) htmlElement.classList.add('lenis-stopped')
      bodyElement.style.position = 'fixed'
      bodyElement.style.top = `-${scrollY}px`
      bodyElement.style.width = '100%'
      bodyElement.style.overflow = 'hidden'

      return () => {
        if (htmlElement) htmlElement.classList.remove('lenis-stopped')
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
            className="fixed inset-0 bg-black/60 z-[199]"
            style={{ willChange: 'opacity' }}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full md:w-[70vw] max-w-4xl z-[200] bg-white shadow-2xl flex flex-col"
            style={{ willChange: 'transform' }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Heart size={24} className="text-black" />
                <span className="text-lg font-bold text-black uppercase tracking-wide">Meus Favoritos</span>
                {state.itemCount > 0 && (
                  <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {state.itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4" style={{ contain: 'layout style paint' }}>
              {state.items.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <Heart size={48} className="mx-auto mb-4 opacity-20" weight="regular" />
                  <p className="text-lg mb-2 font-semibold">Seus favoritos estão vazios</p>
                  <p className="text-sm">Adicione produtos que você ama aos favoritos!</p>
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
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white border border-gray-200 rounded p-4 hover:border-black transition-all duration-200 relative group"
                        >
                          <button
                            onClick={() => removeFavorite(favorite.id)}
                            className="absolute top-2 right-2 p-1.5 bg-gray-100 text-gray-500 hover:bg-black hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
                            title="Remover dos favoritos"
                          >
                            <Trash size={16} />
                          </button>

                          <Link
                            href={`/produto/${favorite.product.slug || favorite.product.id}`}
                            onClick={onClose}
                            className="relative w-full h-64 overflow-hidden bg-gray-50 mb-3 block"
                          >
                            <Image
                              src={favorite.image || favorite.product.image || '/images/Logo.png'}
                              alt={favorite.product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              loading="lazy"
                            />
                          </Link>

                          <div className="space-y-2">
                            <Link
                              href={`/produto/${favorite.product.slug || favorite.product.id}`}
                              onClick={onClose}
                              className="block"
                            >
                              <h3 className="font-bold text-black text-sm uppercase truncate">
                                {favorite.product.name}
                              </h3>
                            </Link>

                            <div className="font-bold text-black text-base">
                              R$ {favorite.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>

                            {(currentSize || favorite.color) && (
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                {currentSize && <span>Tam: {currentSize}</span>}
                                {favorite.color && (
                                  <>
                                    <span>|</span>
                                    <span>Cor: {favorite.color}</span>
                                  </>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleAddToCart(favorite)}
                                disabled={Boolean(
                                  (productHasSizes(favorite.product.id) && (!currentSize || currentSize.trim() === '' || currentSize === 'Selecione')) ||
                                  (currentSize && productSizes[favorite.product.id] && productSizes[favorite.product.id].length > 0 && !isSizeAvailable(favorite.product.id, currentSize))
                                )}
                                className="flex-1 bg-black hover:bg-gray-800 text-white px-3 py-2.5 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                <ShoppingCart size={16} />
                                <span>Adicionar</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {state.items.length > 0 && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover todos os favoritos?')) {
                            clearFavorites()
                          }
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600 underline"
                      >
                        Limpar favoritos
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer if needed */}
            {state.items.length > 0 && <div className="p-4 border-t border-gray-100 bg-white" />}

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
