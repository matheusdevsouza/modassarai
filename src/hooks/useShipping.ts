'use client'
import { useState, useCallback, useEffect } from 'react'
import { ShippingOption, ShippingState, CartItem } from '@/types'

interface UseShippingProps {
  cartItems: CartItem[]
  initialZipCode?: string
}

const SHIPPING_STORAGE_KEY = 'mariapistache_shipping'

const saveShippingToStorage = (zipCode: string, options: ShippingOption[], selectedOption: ShippingOption | null) => {
  if (typeof window === 'undefined') return
  
  try {
    const shippingData = {
      zipCode: zipCode.replace(/\D/g, ''),
      options,
      selectedOption,
      timestamp: Date.now()
    }
    sessionStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shippingData))
  } catch (error) {
    console.error('Erro ao salvar frete no storage:', error)
  }
}

const loadShippingFromStorage = (): { zipCode: string; options: ShippingOption[]; selectedOption: ShippingOption | null } | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const saved = sessionStorage.getItem(SHIPPING_STORAGE_KEY)
    if (!saved) return null
    
    const data = JSON.parse(saved)
    
    const oneHour = 60 * 60 * 1000
    if (Date.now() - data.timestamp > oneHour) {
      sessionStorage.removeItem(SHIPPING_STORAGE_KEY)
      return null
    }
    
    return {
      zipCode: data.zipCode || '',
      options: data.options || [],
      selectedOption: data.selectedOption || null
    }
  } catch (error) {
    console.error('Erro ao carregar frete do storage:', error)
    return null
  }
}

export function useShipping({ cartItems, initialZipCode = '' }: UseShippingProps) {
  const [state, setState] = useState<ShippingState>(() => {
    const saved = loadShippingFromStorage()
    const cleanedInitialZip = initialZipCode.replace(/\D/g, '')
    
    if (saved && saved.zipCode && saved.options && saved.options.length > 0) {
      if (cleanedInitialZip === saved.zipCode || !cleanedInitialZip) {
        return {
          options: saved.options,
          selectedOption: saved.selectedOption,
          isLoading: false,
          error: null,
          zipCode: saved.zipCode
        }
      }
    }
    
    return {
      options: [],
      selectedOption: null,
      isLoading: false,
      error: null,
      zipCode: cleanedInitialZip
    }
  })

  const calculateShipping = useCallback(async (zipCode: string) => {
    if (!zipCode || zipCode.replace(/\D/g, '').length !== 8) {
      setState(prev => ({
        ...prev,
        error: 'CEP inválido',
        isLoading: false,
        options: []
      }))
      return
    }

    if (cartItems.length === 0) {
      setState(prev => ({
        ...prev,
        error: 'Carrinho vazio',
        isLoading: false,
        options: []
      }))
      return
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      zipCode: zipCode.replace(/\D/g, '')
    }))

    try {
      const products = cartItems.map(item => ({
        id: item.product.id,
        weight: (item.product as any).weight,
        length: (item.product as any).length,
        width: (item.product as any).width,
        height: (item.product as any).height,
        price: item.price,
        quantity: item.quantity
      }))

      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postalCode: zipCode.replace(/\D/g, ''),
          products
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao calcular frete')
      }

      const options: ShippingOption[] = data.data || []
      const cleanedZipCode = zipCode.replace(/\D/g, '')
      const newSelectedOption = options.length > 0 ? options[0] : null

      setState(prev => ({
        ...prev,
        options,
        selectedOption: newSelectedOption,
        isLoading: false,
        error: options.length === 0 ? 'Nenhuma opção de frete disponível para este CEP' : null
      }))

      saveShippingToStorage(cleanedZipCode, options, newSelectedOption)
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error)
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao calcular frete. Tente novamente.',
        isLoading: false,
        options: []
      }))
    }
  }, [cartItems])

  const selectOption = useCallback((option: ShippingOption | null) => {
    setState(prev => {
      const newState = {
        ...prev,
        selectedOption: option
      }
      
      if (prev.zipCode && prev.options.length > 0) {
        saveShippingToStorage(prev.zipCode, prev.options, option)
      }
      
      return newState
    })
  }, [])

  const clearShipping = useCallback(() => {
    setState({
      options: [],
      selectedOption: null,
      isLoading: false,
      error: null,
      zipCode: ''
    })
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SHIPPING_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const cleanedInitialZip = initialZipCode.replace(/\D/g, '')
    const saved = loadShippingFromStorage()
    
    if (saved && saved.zipCode && saved.options && saved.options.length > 0) {
      if (cleanedInitialZip === saved.zipCode || !cleanedInitialZip) {
        setState(prev => {
          if (prev.zipCode !== saved.zipCode || prev.options.length !== saved.options.length) {
            return {
              ...prev,
              zipCode: saved.zipCode,
              options: saved.options,
              selectedOption: saved.selectedOption
            }
          }
          return prev
        })
      }
    } else if (cleanedInitialZip && cleanedInitialZip.length === 8) {
      setState(prev => {
        if (prev.zipCode !== cleanedInitialZip) {
          return {
            ...prev,
            zipCode: cleanedInitialZip
          }
        }
        return prev
      })
    }
  }, [initialZipCode])

  useEffect(() => {
    if (state.zipCode && state.zipCode.length === 8 && cartItems.length > 0) {
      const saved = loadShippingFromStorage()
      if (saved && saved.zipCode === state.zipCode && saved.options.length > 0) {
        return
      }
      
      const timer = setTimeout(() => {
        calculateShipping(state.zipCode)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [cartItems, state.zipCode, calculateShipping])

  return {
    ...state,
    calculateShipping,
    selectOption,
    clearShipping
  }
}

