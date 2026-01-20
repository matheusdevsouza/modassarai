import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Plus, Minus, Trash, Truck, MapPin, Clock, CheckCircle, Spinner, ArrowLeft } from 'phosphor-react'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useShipping } from '@/hooks/useShipping'

interface SidebarCartProps {
  open: boolean
  onClose: () => void
}

export default function SidebarCart({ open, onClose }: SidebarCartProps) {
  const { state, addItem, removeItem, updateQuantity, clearCart } = useCart()
  const [zipCode, setZipCode] = useState('')
  const [isShippingMode, setIsShippingMode] = useState(false)

  const {
    options: shippingOptions,
    selectedOption,
    isLoading: isLoadingShipping,
    error: shippingError,
    calculateShipping,
    selectOption
  } = useShipping({ cartItems: state.items, initialZipCode: zipCode })

  const canProceedToCheckout = state.items.length > 0
  const shippingCost = selectedOption?.price || 0
  const totalWithShipping = state.total + shippingCost

  const handleZipCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8)
    setZipCode(cleaned)

    if (cleaned.length === 8) {
      setIsShippingMode(true)
      calculateShipping(cleaned)
    }
  }

  useEffect(() => {
    if (shippingOptions.length > 0 && !isLoadingShipping) {
      setIsShippingMode(true)
    }
  }, [shippingOptions.length, isLoadingShipping])

  const closeShippingMode = () => {
    setIsShippingMode(false)
  }

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
            className="fixed top-0 right-0 h-full w-full max-w-md z-[200] bg-white shadow-2xl flex flex-col"
            style={{ willChange: 'transform' }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart size={24} className="text-black" />
                <span className="text-lg font-bold text-black uppercase tracking-wide">Sacola</span>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ contain: 'layout style paint' }}>
              <AnimatePresence mode="wait">
                {!isShippingMode ? (
                  <motion.div
                    key="cart-items"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-6 py-4"
                  >
                    {state.items.length === 0 ? (
                      <div className="text-center text-gray-500 mt-20">
                        <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Sua sacola está vazia.</p>
                      </div>
                    ) : (
                      <>
                        <ul className="space-y-6">
                          {state.items.map(item => (
                            <li key={item.product.id} className="flex gap-4 items-start">
                              <div className="relative w-24 h-32 flex-shrink-0 bg-gray-50">
                                <Image
                                  src={item.image || '/images/Logo.png'}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                  sizes="96px"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-black text-sm mb-1 leading-tight">{item.product.name}</div>
                                {(item.size || item.color) && (
                                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                                    {item.size && <span>Tam: {item.size}</span>}
                                    {item.color && (
                                      <>
                                        {item.size && <span>|</span>}
                                        <span>Cor: {item.color}</span>
                                      </>
                                    )}
                                  </div>
                                )}
                                <div className="font-bold text-black text-sm mb-3">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center border border-gray-200 rounded">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-50 text-gray-600"><Minus size={14} /></button>
                                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-50 text-gray-600"><Plus size={14} /></button>
                                  </div>
                                  <button onClick={() => removeItem(item.id)} className="text-xs text-red-600 hover:underline">Remover</button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        {state.items.length > 0 && (
                          <div className="mt-8 text-center">
                            <button onClick={clearCart} className="text-xs text-gray-400 hover:text-gray-600 underline">Esvaziar sacola</button>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="shipping-mode"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="px-6 py-6"
                  >
                    <button
                      onClick={closeShippingMode}
                      className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
                    >
                      <ArrowLeft size={18} />
                      <span className="font-medium text-sm">Voltar</span>
                    </button>

                    <div className="mb-6">
                      <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                        <Truck size={20} /> Calcular Frete
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => handleZipCodeChange(e.target.value)}
                          placeholder="Digite seu CEP"
                          maxLength={8}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
                        />
                        {zipCode.length === 8 && (
                          <button
                            onClick={() => calculateShipping(zipCode)}
                            disabled={isLoadingShipping}
                            className="px-6 py-3 bg-black text-white text-sm font-bold uppercase disabled:opacity-50"
                          >
                            {isLoadingShipping ? <Spinner size={18} className="animate-spin" /> : 'OK'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {isLoadingShipping && <div className="text-center py-4"><Spinner size={24} className="animate-spin inline-block" /></div>}
                      {shippingError && <div className="p-3 bg-red-50 text-red-600 text-sm">{shippingError}</div>}

                      {!isLoadingShipping && shippingOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => selectOption(option)}
                          className={`w-full text-left p-4 border rounded transition-all ${selectedOption?.id === option.id ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm">{option.company}</p>
                              <p className="text-xs text-gray-500">Em até {option.estimatedDays} dias úteis</p>
                            </div>
                            <p className="font-bold text-sm">R$ {option.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {state.items.length > 0 && !isShippingMode && (
              <div className="border-t border-gray-100 p-6 bg-white">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">R$ {state.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frete</span>
                    <span className="font-semibold">{selectedOption ? `R$ ${selectedOption.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>R$ {totalWithShipping.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {!selectedOption && (
                    <button
                      onClick={() => setIsShippingMode(true)}
                      className="w-full py-3 border border-black text-black font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors"
                    >
                      Calcular Frete
                    </button>
                  )}
                  <button
                    onClick={() => { onClose(); window.location.href = '/checkout' }}
                    className="w-full py-4 bg-black text-white font-bold uppercase text-sm hover:opacity-90 transition-opacity"
                  >
                    Finalizar Compra
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
