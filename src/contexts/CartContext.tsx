'use client'
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { CartItem, Product } from '@/types'
interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}
type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; size?: string; color?: string; image?: string } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
const CartContext = createContext<{
  state: CartState
  addItem: (product: Product, quantity?: number, size?: string, color?: string, image?: string) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (productId: string) => number
  isCartSidebarOpen: boolean
  setIsCartSidebarOpen: (open: boolean) => void
} | null>(null)
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1, size, color, image } = action.payload
      
      const hasSizes = (product as any).sizes && Array.isArray((product as any).sizes) && (product as any).sizes.length > 0
      if (hasSizes) {
        if (!size || (typeof size === 'string' && (size.trim() === '' || size === 'Selecione'))) {

          if (typeof window !== 'undefined') {
            alert('Por favor, selecione um tamanho antes de adicionar ao carrinho.')
          }
          return state 
        }
      }
      
      const existingItem = state.items.find(item => 
        item.product.id === product.id && 
        item.size === size && 
        item.color === color && 
        item.image === image
      )
      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === product.id && item.size === size && item.color === color && item.image === image
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        const newItem: CartItem = {
          id: `${product.id}_${size || 'Único'}_${color || 'SemCor'}_${Date.now()}`,
          product,
          quantity,
          price: product.price,
          size,
          color,
          image
        }
        newItems = [...state.items, newItem]
      }
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.itemId)
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { itemId } })
      }
      const newItems = state.items.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0
      }
    case 'LOAD_CART': {
      const items = action.payload
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
      return {
        items,
        total,
        itemCount
      }
    }
    default:
      return state
  }
}
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0
  })
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('mariapistache_cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        if (Array.isArray(cartData)) {
          try {
            const restoredItems = restoreCartFromStorage(cartData)
            if (restoredItems.length > 0) {
              dispatch({ type: 'LOAD_CART', payload: restoredItems })
            }
          } catch (error) {

            localStorage.removeItem('mariapistache_cart')
          }
        } else if (cartData.items && Array.isArray(cartData.items)) {
          try {
            const restoredItems = restoreCartFromStorage(cartData.items)
            if (restoredItems.length > 0) {
              dispatch({ type: 'LOAD_CART', payload: restoredItems })
            }
          } catch (error) {

            localStorage.removeItem('mariapistache_cart')
          }
        }
      } catch (error) {

          localStorage.removeItem('mariapistache_cart')
        }
      }
      setIsLoaded(true)
    }
  }, [])
  const sanitizeCartForStorage = (cartItems: CartItem[]) => {
    return cartItems.map(item => {
      if (!item || !item.product) {

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

              return new Date().toISOString()
            }
          })()
        }
      }
    }).filter(Boolean)
  }
  const restoreCartFromStorage = (cartData: any[]): CartItem[] => {
    return cartData.map(item => {
      if (!item || !item.product) {

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

              return new Date()
            }
          })(),
          updatedAt: (() => {
            try {
              const date = new Date(item.product.updatedAt)
              return isNaN(date.getTime()) ? new Date() : date
            } catch (error) {

              return new Date()
            }
          })()
        }
      }
    }).filter(Boolean)
  }
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      const sanitizedItems = sanitizeCartForStorage(state.items)
      const cartData = {
        items: sanitizedItems,
        total: state.total,
        itemCount: state.itemCount,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('mariapistache_cart', JSON.stringify(cartData))
    }
  }, [state, isLoaded])
  const addItem = (product: Product, quantity: number = 1, size?: string, color?: string, image?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity, size, color, image } })
    
    if (typeof window !== 'undefined' && product.id) {
      const cartKey = `cart_stat_${product.id}_${size || 'unico'}`
      const alreadyRecorded = sessionStorage.getItem(cartKey)
      
      if (!alreadyRecorded) {
        sessionStorage.setItem(cartKey, 'true')
        const productIdentifier = (product as any).slug || product.id;
        fetch(`/api/products/${productIdentifier}/stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionType: 'cart_add' })
        }).catch(error => {

        })
      }
    }
  }
  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } })
  }
  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } })
  }
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mariapistache_cart')
    }
  }
  const getItemQuantity = (productId: string): number => {
    return state.items
      .filter(item => item.product.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0)
  }
  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      isCartSidebarOpen,
      setIsCartSidebarOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    if (typeof window === 'undefined') {
      return {
        state: { items: [], total: 0, itemCount: 0 },
        addItem: () => {},
        removeItem: () => {},
        updateQuantity: () => {},
        clearCart: () => {},
        isCartSidebarOpen: false,
        setIsCartSidebarOpen: () => {},
      };
    }
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  return context
}
