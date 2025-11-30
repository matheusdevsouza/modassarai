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
            className="fixed inset-0 bg-black/60 z-[199]"
            style={{ willChange: 'opacity' }}
          />
          
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-[200] bg-sage-50 border-l border-cloud-100 shadow-2xl flex flex-col"
            style={{ willChange: 'transform' }}
          >
          <div className="flex items-center justify-between px-6 py-5 border-b border-cloud-100">
            <div className="flex items-center gap-2">
              <ShoppingCart size={24} className="text-primary-600" />
              <span className="text-lg font-bold text-sage-900">Seu Carrinho</span>
            </div>
            <button onClick={onClose} className="text-sage-700 hover:text-primary-600 transition-colors">
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ contain: 'layout style paint' }}>
            <AnimatePresence mode="wait">
              {!isShippingMode ? (
                <motion.div
                  key="cart-items"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="px-6 py-4"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {state.items.length === 0 ? (
                    <div className="text-center text-sage-700 mt-16">
                      <ShoppingCart size={48} className="mx-auto mb-4 opacity-40 text-sage-400" />
                      Seu carrinho está vazio.
                    </div>
                  ) : (
                    <>
                      <ul className="space-y-4">
                        {state.items.map(item => (
                          <li key={item.product.id} className="bg-white border border-cloud-100 rounded-xl p-4 flex gap-4 items-center hover:border-primary-300 transition-colors shadow-sm">
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-sand-100">
                              <Image
                                src={item.image || '/images/Logo.png'}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sage-900 truncate mb-1">{item.product.name}</div>
                              {(item.size || item.color) && (
                                <div className="text-sm text-sage-700 mb-1 flex items-center gap-2 flex-wrap">
                                  {item.size && <span>Tamanho: {item.size}</span>}
                                  {item.color && (
                                    <span className="flex items-center gap-1">
                                      {item.size && <span className="text-sage-500">•</span>}
                                      Cor: {item.color}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="text-primary-600 font-bold text-base">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                              <div className="flex items-center gap-2 mt-2">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded bg-cloud-100 text-sage-800 hover:bg-primary-500 hover:text-white transition-colors"><Minus size={16} /></button>
                                <span className="px-2 text-sage-900 font-semibold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded bg-cloud-100 text-sage-800 hover:bg-primary-500 hover:text-white transition-colors"><Plus size={16} /></button>
                                <button onClick={() => removeItem(item.id)} className="ml-4 p-1 rounded bg-cloud-100 text-red-500 hover:bg-red-600 hover:text-white transition-colors"><Trash size={16} /></button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {state.items.length > 0 && (
                        <div className="flex justify-center mt-6">
                          <button
                            className="py-2 px-6 rounded-xl bg-cloud-100 text-sage-800 hover:bg-sage-200 transition-colors text-sm"
                            onClick={clearCart}
                          >
                            Limpar Carrinho
                          </button>
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
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="px-6 py-6"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <button
                    onClick={closeShippingMode}
                    className="flex items-center gap-2 text-sage-700 hover:text-primary-600 transition-colors mb-6 group"
                  >
                    <ArrowLeft size={20} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">Voltar ao carrinho</span>
                  </button>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2.5 bg-primary-100 rounded-xl">
                        <MapPin size={22} className="text-primary-600" weight="fill" />
                      </div>
                      <label className="text-base font-bold text-sage-900">
                        Calcular Frete
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => handleZipCodeChange(e.target.value)}
                        placeholder="Digite o CEP"
                        maxLength={8}
                        className="flex-1 px-4 py-3 border-2 border-cloud-200 rounded-xl text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-sm font-medium bg-white shadow-sm"
                      />
                      {zipCode.length === 8 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => calculateShipping(zipCode)}
                          disabled={isLoadingShipping}
                          className="px-5 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-md hover:shadow-lg whitespace-nowrap flex items-center justify-center"
                        >
                          {isLoadingShipping ? (
                            <Spinner size={18} className="animate-spin" />
                          ) : (
                            'Calcular'
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isLoadingShipping && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-center gap-3 py-8 bg-primary-50/50 rounded-xl mb-4"
                      >
                        <Spinner size={24} className="animate-spin text-primary-600" />
                        <span className="text-sm font-medium text-sage-700">Calculando opções de frete...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {shippingError && !isLoadingShipping && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4"
                      >
                        <p className="text-sm text-red-700 font-medium text-center">{shippingError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                      {shippingOptions.length > 0 && !isLoadingShipping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                        style={{ willChange: 'opacity' }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Truck size={22} className="text-primary-600" weight="fill" />
                            <h4 className="text-base font-bold text-sage-900">
                              {shippingOptions.length} {shippingOptions.length === 1 ? 'Opção' : 'Opções'} Disponível{shippingOptions.length > 1 ? 's' : ''}
                            </h4>
                            {shippingOptions.length > 4}
                          </div>
                          {selectedOption && (
                            <div className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold">
                              <CheckCircle size={16} weight="fill" />
                              <span>Selecionado</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {shippingOptions.slice(0, 4).map((option, index) => (
                            <motion.button
                              key={option.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05, duration: 0.15 }}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => selectOption(option)}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden ${
                                selectedOption?.id === option.id
                                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                                  : 'border-cloud-200 bg-white hover:border-primary-300 hover:shadow-md'
                              }`}
                              style={{ willChange: 'transform' }}
                            >
                              {selectedOption?.id === option.id && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent" />
                              )}
                              
                              <div className="relative flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                      selectedOption?.id === option.id
                                        ? 'border-primary-500 bg-primary-500 shadow-sm'
                                        : 'border-cloud-300 bg-white'
                                    }`}>
                                      {selectedOption?.id === option.id && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="w-3 h-3 rounded-full bg-white"
                                        />
                                      )}
                                    </div>
                                    
                                    <span className={`font-bold text-base ${
                                      selectedOption?.id === option.id ? 'text-primary-700' : 'text-sage-900'
                                    }`}>
                                      {option.company}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 text-xs text-sage-600 ml-9">
                                    <Clock size={14} weight="fill" />
                                    <span>
                                      Entrega em {option.estimatedDays} {option.estimatedDays === 1 ? 'dia útil' : 'dias úteis'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex-shrink-0">
                                  <div className={`text-right font-extrabold text-xl ${
                                    selectedOption?.id === option.id ? 'text-primary-600' : 'text-sage-900'
                                  }`}>
                                    R$ {option.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                  {index === 0 && shippingOptions.length > 1 && (
                                    <div className="text-xs text-primary-600 font-medium mt-1">
                                      Mais rápido
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {state.items.length > 0 && !isShippingMode && (
            <div className="border-t border-cloud-100 px-6 py-4 bg-white">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary-100 rounded-lg">
                    <MapPin size={16} className="text-primary-600" weight="fill" />
                  </div>
                  <label className="text-sm font-semibold text-sage-900">
                    Calcular Frete
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => handleZipCodeChange(e.target.value)}
                    placeholder="Digite o CEP"
                    maxLength={8}
                    className="flex-1 px-3 py-2 border-2 border-cloud-200 rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-sm font-medium bg-white"
                  />
                  {zipCode.length === 8 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsShippingMode(true)
                        calculateShipping(zipCode)
                      }}
                      disabled={isLoadingShipping}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold whitespace-nowrap flex items-center justify-center"
                    >
                      {isLoadingShipping ? (
                        <Spinner size={16} className="animate-spin" />
                      ) : (
                        'Calcular'
                      )}
                    </motion.button>
                  )}
                </div>
                {selectedOption && !shippingOptions.length && (
                  <div className="mt-2 text-xs text-primary-600 font-medium">
                    Frete selecionado: {selectedOption.company}
                  </div>
                )}
              </div>
            </div>
          )}
            
          <div className="border-t border-cloud-100 px-6 py-5 bg-sage-50 z-[300]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sage-800 font-semibold">Subtotal</span>
              <span className="text-lg font-bold text-primary-600">
                R$ {state.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sage-700 text-sm">Frete</span>
              <span className="text-sm text-primary-600 font-bold">
                {selectedOption ? (
                  <>R$ {selectedOption.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</>
                ) : zipCode.length === 8 && !isLoadingShipping && shippingOptions.length === 0 ? (
                  <span className="text-red-600">Não disponível</span>
                ) : (
                  <>Informe o CEP</>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4 pt-2 border-t border-cloud-100">
              <span className="text-sage-900 font-semibold">Total</span>
              <span className="text-xl font-bold text-primary-600">
                R$ {totalWithShipping.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={() => {
                onClose()
                window.location.href = '/checkout'
              }}
              disabled={!canProceedToCheckout}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                canProceedToCheckout
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-cloud-200 text-sage-600 cursor-not-allowed'
              }`}
            >
              {canProceedToCheckout ? 'Ir para Checkout' : 'Carrinho vazio'}
            </button>
          </div>
        </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
