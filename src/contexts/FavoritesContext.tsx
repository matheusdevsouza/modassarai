'use client'
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { FavoriteItem, Product } from '@/types'

interface FavoritesState {
  items: FavoriteItem[]
  itemCount: number
}

type FavoritesAction =
  | { type: 'ADD_FAVORITE'; payload: { product: Product; size?: string; color?: string; image?: string } }
  | { type: 'REMOVE_FAVORITE'; payload: { favoriteId: string } }
  | { type: 'UPDATE_FAVORITE'; payload: { favoriteId: string; size?: string; color?: string; image?: string } }
  | { type: 'CLEAR_FAVORITES' }
  | { type: 'LOAD_FAVORITES'; payload: FavoriteItem[] }

const FavoritesContext = createContext<{
  state: FavoritesState
  addFavorite: (product: Product, size?: string, color?: string, image?: string) => void
  removeFavorite: (favoriteId: string) => void
  updateFavorite: (favoriteId: string, size?: string, color?: string, image?: string) => void
  clearFavorites: () => void
  isFavorite: (productId: string, size?: string, color?: string) => boolean
  isProductFavorite: (productId: string) => boolean
  getFavoriteId: (productId: string, size?: string, color?: string) => string | null
  getProductFavoriteId: (productId: string) => string | null
  isFavoritesSidebarOpen: boolean
  setIsFavoritesSidebarOpen: (open: boolean) => void
} | null>(null)

const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'ADD_FAVORITE': {
      const { product, size, color, image } = action.payload
      const existingFavorite = state.items.find(
        item => 
          item.product.id === product.id && 
          item.size === size && 
          item.color === color
      )

      if (existingFavorite) {
        return state
      }

      const newFavorite: FavoriteItem = {
        id: `${product.id}_${size || 'unico'}_${color || 'unico'}_${Date.now()}`,
        product,
        size,
        color,
        image,
        addedAt: new Date(),
      }

      return {
        items: [...state.items, newFavorite],
        itemCount: state.items.length + 1
      }
    }
    case 'REMOVE_FAVORITE': {
      const newItems = state.items.filter(item => item.id !== action.payload.favoriteId)
      return {
        items: newItems,
        itemCount: newItems.length
      }
    }
    case 'UPDATE_FAVORITE': {
      const { favoriteId, size, color, image } = action.payload
      const newItems = state.items.map(item =>
        item.id === favoriteId
          ? { ...item, size, color, image, addedAt: item.addedAt }
          : item
      )
      return {
        items: newItems,
        itemCount: newItems.length
      }
    }
    case 'CLEAR_FAVORITES':
      return {
        items: [],
        itemCount: 0
      }
    case 'LOAD_FAVORITES': {
      const items = action.payload
      return {
        items,
        itemCount: items.length
      }
    }
    default:
      return state
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, {
    items: [],
    itemCount: 0
  })
  const [isFavoritesSidebarOpen, setIsFavoritesSidebarOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('mariapistache_favorites')
      if (savedFavorites) {
        try {
          const favoritesData = JSON.parse(savedFavorites)
          if (Array.isArray(favoritesData)) {
            try {
              const restoredItems = restoreFavoritesFromStorage(favoritesData)
              if (restoredItems.length > 0) {
                dispatch({ type: 'LOAD_FAVORITES', payload: restoredItems })
              }
            } catch (error) {
              console.error('Erro ao restaurar favoritos:', error)
              localStorage.removeItem('mariapistache_favorites')
            }
          } else if (favoritesData.items && Array.isArray(favoritesData.items)) {
            try {
              const restoredItems = restoreFavoritesFromStorage(favoritesData.items)
              if (restoredItems.length > 0) {
                dispatch({ type: 'LOAD_FAVORITES', payload: restoredItems })
              }
            } catch (error) {
              console.error('Erro ao restaurar favoritos:', error)
              localStorage.removeItem('mariapistache_favorites')
            }
          }
        } catch (error) {
          console.error('Erro ao carregar favoritos:', error)
          localStorage.removeItem('mariapistache_favorites')
        }
      }
      setIsLoaded(true)
    }
  }, [])

  const sanitizeFavoritesForStorage = (favoriteItems: FavoriteItem[]) => {
    return favoriteItems.map(item => {
      if (!item || !item.product) {
        console.warn('Item inválido encontrado nos favoritos:', item)
        return null
      }
      return {
        ...item,
        product: {
          ...item.product,
          createdAt: (() => {
            try {
              if (item.product.createdAt instanceof Date && !isNaN(item.product.createdAt.getTime())) {
                return item.product.createdAt.toISOString()
              } else if (typeof item.product.createdAt === 'string') {
                return item.product.createdAt
              } else {
                return new Date().toISOString()
              }
            } catch (error) {
              console.warn('Erro ao processar createdAt:', error)
              return new Date().toISOString()
            }
          })(),
          updatedAt: (() => {
            try {
              if (item.product.updatedAt instanceof Date && !isNaN(item.product.updatedAt.getTime())) {
                return item.product.updatedAt.toISOString()
              } else if (typeof item.product.updatedAt === 'string') {
                return item.product.updatedAt
              } else {
                return new Date().toISOString()
              }
            } catch (error) {
              console.warn('Erro ao processar updatedAt:', error)
              return new Date().toISOString()
            }
          })()
        },
        addedAt: item.addedAt instanceof Date ? item.addedAt.toISOString() : item.addedAt
      }
    }).filter(Boolean)
  }

  const restoreFavoritesFromStorage = (favoritesData: any[]): FavoriteItem[] => {
    return favoritesData.map(item => {
      if (!item || !item.product) {
        console.warn('Item inválido encontrado no localStorage:', item)
        return null
      }
      return {
        ...item,
        product: {
          ...item.product,
          createdAt: (() => {
            try {
              const date = new Date(item.product.createdAt)
              return isNaN(date.getTime()) ? new Date() : date
            } catch (error) {
              console.warn('Erro ao restaurar createdAt:', error)
              return new Date()
            }
          })(),
          updatedAt: (() => {
            try {
              const date = new Date(item.product.updatedAt)
              return isNaN(date.getTime()) ? new Date() : date
            } catch (error) {
              console.warn('Erro ao restaurar updatedAt:', error)
              return new Date()
            }
          })()
        },
        addedAt: (() => {
          try {
            const date = new Date(item.addedAt)
            return isNaN(date.getTime()) ? new Date() : date
          } catch (error) {
            console.warn('Erro ao restaurar addedAt:', error)
            return new Date()
          }
        })()
      }
    }).filter(Boolean)
  }

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      const sanitizedItems = sanitizeFavoritesForStorage(state.items)
      const favoritesData = {
        items: sanitizedItems,
        itemCount: state.itemCount,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('mariapistache_favorites', JSON.stringify(favoritesData))
    }
  }, [state, isLoaded])

  const addFavorite = (product: Product, size?: string, color?: string, image?: string) => {
    const hasSizes = (product as any).sizes && Array.isArray((product as any).sizes) && (product as any).sizes.length > 0
    if (hasSizes) {
      if (!size || (typeof size === 'string' && (size.trim() === '' || size === 'Selecione'))) {
        console.warn('Tentativa de adicionar produto com tamanhos aos favoritos sem selecionar tamanho')
        return 
      }
    }
    
    const hasColors = (product as any).colorVariations && Array.isArray((product as any).colorVariations) && (product as any).colorVariations.length > 0
    if (hasColors) {
      if (!color || (typeof color === 'string' && color.trim() === '')) {
        console.warn('Tentativa de adicionar produto com variações de cor aos favoritos sem selecionar cor')
        return 
      }
    }
    
    dispatch({ type: 'ADD_FAVORITE', payload: { product, size, color, image } })
    
    if (typeof window !== 'undefined' && product.id) {
      const productIdentifier = (product as any).slug || product.id;
      fetch(`/api/products/${productIdentifier}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'favorite' })
      }).catch(error => {
        console.error('Erro ao registrar estatística de favorito:', error)
      })
    }
  }

  const removeFavorite = (favoriteId: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: { favoriteId } })
  }

  const updateFavorite = (favoriteId: string, size?: string, color?: string, image?: string) => {
    dispatch({ type: 'UPDATE_FAVORITE', payload: { favoriteId, size, color, image } })
  }

  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mariapistache_favorites')
    }
  }

  const isFavorite = (productId: string, size?: string, color?: string): boolean => {
    return state.items.some(
      item => 
        item.product.id === productId && 
        item.size === size && 
        item.color === color
    )
  }

  const getFavoriteId = (productId: string, size?: string, color?: string): string | null => {
    const favorite = state.items.find(
      item => 
        item.product.id === productId && 
        item.size === size && 
        item.color === color
    )
    return favorite ? favorite.id : null
  }

  const isProductFavorite = (productId: string): boolean => {
    return state.items.some(item => item.product.id === productId)
  }

  const getProductFavoriteId = (productId: string): string | null => {
    const favorite = state.items.find(item => item.product.id === productId)
    return favorite ? favorite.id : null
  }

  return (
    <FavoritesContext.Provider value={{
      state,
      addFavorite,
      removeFavorite,
      updateFavorite,
      clearFavorites,
      isFavorite,
      isProductFavorite,
      getFavoriteId,
      getProductFavoriteId,
      isFavoritesSidebarOpen,
      setIsFavoritesSidebarOpen
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    if (typeof window === 'undefined') {
      return {
        state: { items: [], itemCount: 0 },
        addFavorite: () => {},
        removeFavorite: () => {},
        updateFavorite: () => {},
        clearFavorites: () => {},
        isFavorite: () => false,
        isProductFavorite: () => false,
        getFavoriteId: () => null,
        getProductFavoriteId: () => null,
        isFavoritesSidebarOpen: false,
        setIsFavoritesSidebarOpen: () => {},
      }
    }
    throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider')
  }
  return context
}

