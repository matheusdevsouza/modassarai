import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Plus, Minus, Trash } from 'phosphor-react'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
interface SidebarCartProps {
  open: boolean
  onClose: () => void
}
export default function SidebarCart({ open, onClose }: SidebarCartProps) {
  const { state, addItem, removeItem, updateQuantity, clearCart } = useCart()
  const canProceedToCheckout = state.items.length > 0
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
            className="fixed top-0 right-0 h-full w-full max-w-md z-[200] bg-sage-50 border-l border-cloud-100 shadow-2xl flex flex-col"
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
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {state.items.length === 0 ? (
              <div className="text-center text-sage-700 mt-16">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-40 text-sage-400" />
                Seu carrinho está vazio.
              </div>
            ) : (
              <>
                <ul className="space-y-4">
                  {state.items.map(item => (
                    <li key={item.product.id} className="bg-white border border-cloud-100 rounded-xl p-4 flex gap-4 items-center hover:border-primary-300 transition-all shadow-sm">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-sand-100">
                        <Image
                          src={item.image || '/images/Logo.png'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
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
          </div>
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
                GRÁTIS!
              </span>
            </div>
            <div className="flex items-center justify-between mb-4 pt-2 border-t border-cloud-100">
              <span className="text-sage-900 font-semibold">Total</span>
              <span className="text-xl font-bold text-primary-600">
                R$ {state.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
