"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaSpinner, FaSave, FaArrowLeft, FaCheckCircle, FaBox, FaDollarSign, FaWarehouse, FaToggleOn, FaToggleOff, FaFileAlt, FaImage, FaRuler, FaTags, FaTimes, FaPlus } from 'react-icons/fa'
import MediaManager from '@/components/admin/MediaManager'
import ProductSizesManager from '@/components/admin/ProductSizesManager'

interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock_quantity: number
  is_active: boolean
}

interface Category {
  id: number;
  name: string;
  slug: string;
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
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [productCategories, setProductCategories] = useState<Category[]>([])
  const [addingCategory, setAddingCategory] = useState(false)
  const [removingCategory, setRemovingCategory] = useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [productRes, categoriesRes, productCategoriesRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch('/api/admin/categories'),
          fetch(`/api/admin/products/${id}/categories`)
        ])
        if (!productRes.ok) throw new Error('Falha ao carregar produto')
        const productData = await productRes.json()
        const categoriesData = await categoriesRes.json()
        const productCategoriesData = await productCategoriesRes.json()
        const data = productData.product || productData.data
        if (!data || !data.id) {
          throw new Error('Dados do produto inválidos')
        }
        setProduct({
          id: data.id,
          name: data.name || '',
          description: data.description ?? '',
          price: Number(data.price ?? 0),
          stock_quantity: Number(data.stock_quantity ?? 0),
          is_active: Boolean(data.is_active)
        })
        if (categoriesData.success) {
          const cats = categoriesData.data || []
          setAllCategories(Array.isArray(cats) ? cats : [])
        }
        if (productCategoriesData.success) {
          const prodCats = productCategoriesData.data || []
          setProductCategories(Array.isArray(prodCats) ? prodCats : [])
        }
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
          is_active: Boolean(product.is_active)
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

  async function handleAddCategory(categoryId: number) {
    if (productCategories.some(c => c.id === categoryId)) return
    setAddingCategory(true)
    try {
      const res = await fetch(`/api/admin/products/${id}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId })
      })
      const result = await res.json()
      if (result.success) {
        const category = allCategories.find(c => c.id === categoryId)
        if (category) {
          setProductCategories([...productCategories, category])
        }
      } else {
        setError(result.error || 'Erro ao adicionar categoria')
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao adicionar categoria')
    } finally {
      setAddingCategory(false)
    }
  }

  async function handleRemoveCategory(categoryId: number) {
    if (removingCategory === categoryId) return
    setRemovingCategory(categoryId)
    try {
      const res = await fetch(`/api/admin/products/${id}/categories?categoryId=${categoryId}`, {
        method: 'DELETE'
      })
      const result = await res.json()
      if (result.success) {
        setProductCategories(productCategories.filter(c => c.id !== categoryId))
      } else {
        setError(result.error || 'Erro ao remover categoria')
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao remover categoria')
    } finally {
      setRemovingCategory(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-2 border-transparent border-b-primary-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-red-200 rounded-2xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSpinner className="text-red-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-sage-900 mb-2">Erro ao carregar produto</h3>
            <p className="text-sage-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
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
    <div className="min-h-screen bg-primary-50 text-sage-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 text-sage-600 hover:text-primary-600 transition-colors duration-300 mb-4 group"
          >
            <FaArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" /> 
            <span>Voltar</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-2">
                Editar Produto #{product.id}
              </h1>
              <p className="text-sage-600 text-sm sm:text-base">
                Gerencie as informações e configurações do produto
              </p>
            </div>
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl disabled:opacity-60 transition-all duration-300 shadow-lg shadow-primary-100/50"
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
            className="mb-6 bg-green-200 border border-green-300 rounded-xl p-4 flex items-center gap-3"
          >
            <FaCheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <span className="text-green-600 font-medium">Alterações salvas com sucesso!</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-200 border border-red-300 rounded-xl p-4 flex items-center gap-3"
          >
            <FaSpinner className="text-red-600 flex-shrink-0" size={20} />
            <span className="text-red-600 font-medium">{error}</span>
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
            className="bg-white border border-primary-100 rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
                  <FaBox className="text-primary-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-sage-900">Informações Básicas</h2>
                  <p className="text-sm text-sage-600">Dados principais do produto</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                    placeholder="Digite o nome do produto"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-sage-700 mb-2 flex items-center gap-2">
                    <FaTags className="text-primary-500" size={14} />
                    Categorias
                  </label>
                  <div className="space-y-3">
                    {productCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-primary-50 rounded-xl border border-primary-100">
                        {productCategories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-primary-700 border border-primary-200 text-sm font-medium group relative shadow-sm hover:shadow-md transition-all"
                          >
                            <FaTags size={12} className="text-primary-500" />
                            <span>{category.name}</span>
                            <button
                              onClick={() => handleRemoveCategory(category.id)}
                              disabled={removingCategory === category.id}
                              className="ml-1 p-1 text-primary-600 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100 disabled:opacity-100"
                              title="Remover categoria"
                            >
                              {removingCategory === category.id ? (
                                <FaSpinner className="animate-spin" size={10} />
                              ) : (
                                <FaTimes size={10} />
                              )}
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {productCategories.length === 0 && (
                      <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 text-center">
                        <FaTags className="text-sage-400 mx-auto mb-2" size={20} />
                        <span className="text-sage-500 text-sm italic block">Nenhuma categoria associada</span>
                      </div>
                    )}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <FaPlus className="text-sage-500" size={14} />
                      </div>
                  <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddCategory(Number(e.target.value))
                            e.target.value = ''
                          }
                        }}
                        disabled={addingCategory || allCategories.filter(cat => !productCategories.some(pc => pc.id === cat.id)).length === 0}
                        className="w-full bg-primary-50 border border-primary-100 rounded-xl pl-10 pr-10 py-3 text-sage-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                        <option value="">
                          {allCategories.filter(cat => !productCategories.some(pc => pc.id === cat.id)).length === 0
                            ? 'Todas as categorias já foram adicionadas'
                            : '+ Adicionar categoria'}
                        </option>
                        {allCategories
                          .filter(cat => !productCategories.some(pc => pc.id === cat.id))
                          .map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                    ))}
                  </select>
                      {addingCategory && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <FaSpinner className="animate-spin text-primary-500" size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Status do Produto
                  </label>
                  <select
                    value={product.is_active ? 'true' : 'false'}
                    onChange={(e) => setProduct({ ...product, is_active: e.target.value === 'true' })}
                    className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
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
            className="bg-white border border-primary-100 rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
                  <FaDollarSign className="text-primary-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-sage-900">Preço e Estoque</h2>
                  <p className="text-sm text-sage-600">Valores e disponibilidade</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Preço (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                      className="w-full bg-primary-50 border border-primary-100 rounded-xl pl-10 pr-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Estoque Total *
                  </label>
                  <div className="relative">
                    <FaWarehouse className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-500" size={16} />
                    <input
                      type="number"
                      min="0"
                      value={product.stock_quantity}
                      onChange={(e) => setProduct({ ...product, stock_quantity: Number(e.target.value) })}
                      className="w-full bg-primary-50 border border-primary-100 rounded-xl pl-10 pr-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white border border-primary-100 rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
                  <FaFileAlt className="text-primary-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-sage-900">Descrição</h2>
                  <p className="text-sm text-sage-600">Detalhes e informações do produto</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <textarea
                rows={6}
                value={product.description || ''}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300 resize-none"
                placeholder="Descreva o produto em detalhes..."
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white border border-primary-100 rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
                  <FaRuler className="text-primary-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-sage-900">Gerenciamento de Tamanhos</h2>
                  <p className="text-sm text-sage-600">Configure os tamanhos disponíveis</p>
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
            className="bg-white border border-primary-100 rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
                  <FaImage className="text-primary-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-sage-900">Gerenciamento de Mídia</h2>
                  <p className="text-sm text-sage-600">Imagens e vídeos do produto</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <MediaManager 
                productId={product.id} 
                onMediaUpdate={() => {
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
            className="w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-60 transition-all duration-300 flex items-center justify-center"
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
