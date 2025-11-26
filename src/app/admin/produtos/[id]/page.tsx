"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaSpinner, FaSave, FaArrowLeft, FaCheckCircle, FaBox, FaDollarSign, FaWarehouse, FaToggleOn, FaToggleOff, FaFileAlt, FaImage, FaRuler } from 'react-icons/fa'
import MediaManager from '@/components/admin/MediaManager'
import ProductSizesManager from '@/components/admin/ProductSizesManager'

interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock_quantity: number
  is_active: boolean
  model_id?: number
}

interface Model {
  id: number;
  name: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params?.id)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [models, setModels] = useState<Model[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [productRes, modelsRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch('/api/models')
        ])
        if (!productRes.ok) throw new Error('Falha ao carregar produto')
        const productData = await productRes.json()
        const modelsData = await modelsRes.json()
        const data = productData.product
        if (!data || !data.id) {
          throw new Error('Dados do produto inválidos')
        }
        setProduct({
          id: data.id,
          name: data.name || '',
          description: data.description ?? '',
          price: Number(data.price ?? 0),
          stock_quantity: Number(data.stock_quantity ?? 0),
          is_active: Boolean(data.is_active),
          model_id: data.model_id ? Number(data.model_id) : undefined
        })
        if (modelsData.success) setModels(modelsData.data || [])
      } catch (e: any) {
        setError(e.message || 'Erro inesperado')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  async function handleSave() {
    if (!product) return
    try {
      setSaving(true)
      setError(null)
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: Number(product.price),
          stock_quantity: Number(product.stock_quantity),
          is_active: Boolean(product.is_active),
          model_id: product.model_id
        })
      })
      if (!res.ok) throw new Error('Falha ao salvar alterações')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-transparent border-t-[var(--logo-gold,#D4A574)] border-r-[var(--logo-gold,#D4A574)]/50 rounded-full spinner-gold"></div>
          <div className="absolute inset-3 border-4 border-transparent border-b-[var(--logo-gold-light,#E6B896)] border-l-[var(--logo-gold-light,#E6B896)]/50 rounded-full spinner-gold-reverse"></div>
          <div className="absolute inset-6 border-2 border-transparent border-r-[var(--logo-gold,#D4A574)] rounded-full spinner-gold-slow"></div>
        </div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSpinner className="text-red-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Erro ao carregar produto</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="bg-[var(--logo-gold,#D4A574)] hover:bg-[var(--logo-gold-light,#E6B896)] text-[#0D0D0D] font-semibold px-6 py-3 rounded-xl transition-all duration-300"
            >
              Voltar
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[var(--logo-gold,#D4A574)] transition-colors duration-300 mb-4 group"
          >
            <FaArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" /> 
            <span>Voltar</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                Editar Produto #{product.id}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Gerencie as informações e configurações do produto
              </p>
            </div>
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--logo-gold,#D4A574)] to-[var(--logo-gold-light,#E6B896)] hover:from-[var(--logo-gold-light,#E6B896)] hover:to-[var(--logo-gold,#D4A574)] text-[#0D0D0D] font-semibold rounded-xl disabled:opacity-60 transition-all duration-300 shadow-lg shadow-[var(--logo-gold,#D4A574)]/20"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" size={16} />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <FaSave size={16} />
                  <span>Salvar Alterações</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <FaCheckCircle className="text-green-400 flex-shrink-0" size={20} />
            <span className="text-green-400 font-medium">Alterações salvas com sucesso!</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <FaSpinner className="text-red-400 flex-shrink-0" size={20} />
            <span className="text-red-400 font-medium">{error}</span>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div
            variants={itemVariants}
            className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--logo-gold,#D4A574)]/20 rounded-lg flex items-center justify-center">
                  <FaBox className="text-[var(--logo-gold,#D4A574)]" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Informações Básicas</h2>
                  <p className="text-sm text-gray-400">Dados principais do produto</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[var(--logo-gold,#D4A574)] focus:ring-2 focus:ring-[var(--logo-gold,#D4A574)]/20 transition-all duration-300"
                    placeholder="Digite o nome do produto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Modelo
                  </label>
                  <select
                    value={product.model_id || ''}
                    onChange={(e) => setProduct({ ...product, model_id: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:border-[var(--logo-gold,#D4A574)] focus:ring-2 focus:ring-[var(--logo-gold,#D4A574)]/20 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="">Selecione um modelo</option>
                    {models.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status do Produto
                  </label>
                  <select
                    value={product.is_active ? 'true' : 'false'}
                    onChange={(e) => setProduct({ ...product, is_active: e.target.value === 'true' })}
                    className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:border-[var(--logo-gold,#D4A574)] focus:ring-2 focus:ring-[var(--logo-gold,#D4A574)]/20 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="true">✅ Ativo</option>
                    <option value="false">❌ Inativo</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--logo-gold,#D4A574)]/20 rounded-lg flex items-center justify-center">
                  <FaDollarSign className="text-[var(--logo-gold,#D4A574)]" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Preço e Estoque</h2>
                  <p className="text-sm text-gray-400">Valores e disponibilidade</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preço (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                      className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-[var(--logo-gold,#D4A574)] focus:ring-2 focus:ring-[var(--logo-gold,#D4A574)]/20 transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estoque Total *
                  </label>
                  <div className="relative">
                    <FaWarehouse className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      min="0"
                      value={product.stock_quantity}
                      onChange={(e) => setProduct({ ...product, stock_quantity: Number(e.target.value) })}
                      className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-[var(--logo-gold,#D4A574)] focus:ring-2 focus:ring-[var(--logo-gold,#D4A574)]/20 transition-all duration-300"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--logo-gold,#D4A574)]/20 rounded-lg flex items-center justify-center">
                  <FaFileAlt className="text-[var(--logo-gold,#D4A574)]" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Descrição</h2>
                  <p className="text-sm text-gray-400">Detalhes e informações do produto</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <textarea
                rows={6}
                value={product.description || ''}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[var(--logo-gold,#D4A574)] focus:ring-2 focus:ring-[var(--logo-gold,#D4A574)]/20 transition-all duration-300 resize-none"
                placeholder="Descreva o produto em detalhes..."
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--logo-gold,#D4A574)]/20 rounded-lg flex items-center justify-center">
                  <FaRuler className="text-[var(--logo-gold,#D4A574)]" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Gerenciamento de Tamanhos</h2>
                  <p className="text-sm text-gray-400">Configure os tamanhos disponíveis</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ProductSizesManager 
                productId={product.id} 
                productName={product.name}
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--logo-gold,#D4A574)]/20 rounded-lg flex items-center justify-center">
                  <FaImage className="text-[var(--logo-gold,#D4A574)]" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Gerenciamento de Mídia</h2>
                  <p className="text-sm text-gray-400">Imagens e vídeos do produto</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <MediaManager 
                productId={product.id} 
                onMediaUpdate={() => {
                  console.log('Mídia atualizada');
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        <div className="fixed bottom-6 right-6 sm:hidden z-50">
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.1 }}
            whileTap={{ scale: saving ? 1 : 0.9 }}
            className="w-14 h-14 bg-gradient-to-r from-[var(--logo-gold,#D4A574)] to-[var(--logo-gold-light,#E6B896)] text-[#0D0D0D] rounded-full shadow-lg hover:shadow-xl disabled:opacity-60 transition-all duration-300 flex items-center justify-center"
          >
            {saving ? (
              <FaSpinner className="animate-spin" size={20} />
            ) : (
              <FaSave size={20} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
