'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MagnifyingGlass, Package, ShoppingCart, Heart, Eye, ArrowRight, Funnel, ArrowsDownUp, Square, List } from 'phosphor-react'
import Image from 'next/image'
import Link from 'next/link'
const formatPrice = (price: any): string => {
  if (typeof price === 'number' && !isNaN(price)) {
    return price.toFixed(2).replace('.', ',')
  }
  if (typeof price === 'string') {
    const numPrice = parseFloat(price)
    if (!isNaN(numPrice)) {
      return numPrice.toFixed(2).replace('.', ',')
    }
  }
  return '0,00'
}
const ProductCard = ({ 
  product, 
  index
}: { 
  product: any; 
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group bg-sage-50 border border-cloud-100 rounded-2xl overflow-hidden hover:border-primary-300 transition-all duration-300 hover:shadow-xl flex flex-col"
  >
    <div className="relative aspect-[3/4] overflow-hidden bg-cloud-100">
      <Image
        src={product.image || product.primary_image || (product.images && product.images[0]?.url) || '/images/logo.png'}
        alt={product.name}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Link 
          href={`/produto/${product.slug}`}
          className="w-8 h-8 bg-white/90 hover:bg-primary-500 rounded-full flex items-center justify-center text-sage-800 hover:text-white transition-colors duration-200 shadow-md"
        >
          <Eye size={16} />
        </Link>
      </div>
    </div>
    <div className="p-5 space-y-3 flex-1 flex flex-col">
      <div>
        <h3 className="text-lg font-semibold text-sage-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 mb-1">
          {product.name}
        </h3>
      </div>
      <div className="flex items-center gap-2 justify-center">
        <span className="text-2xl font-bold text-primary-600">
          R$ {formatPrice(product.price)}
        </span>
        {product.original_price && parseFloat(product.original_price.toString()) > parseFloat(product.price.toString()) && (
          <span className="text-sm text-sage-600 line-through">
            R$ {formatPrice(product.original_price)}
          </span>
        )}
      </div>
      <Link
        href={`/produto/${product.slug}`}
        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn"
      >
        <ShoppingCart size={18} />
        Ver Produto
        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
      </Link>
    </div>
  </motion.div>
)
const ProductSkeleton = () => (
  <div className="bg-sage-50 border border-cloud-100 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-[3/4] bg-cloud-100"></div>
    <div className="p-5 space-y-3">
      <div className="h-4 bg-cloud-100 rounded w-3/4"></div>
      <div className="h-3 bg-cloud-100 rounded w-1/2"></div>
      <div className="h-5 bg-cloud-100 rounded w-1/3"></div>
      <div className="h-4 bg-cloud-100 rounded w-1/2"></div>
      <div className="h-12 bg-cloud-100 rounded-xl w-full"></div>
    </div>
  </div>
)
function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: ''
  })
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [productSizes, setProductSizes] = useState<any[]>([])
  const [loadingSizes, setLoadingSizes] = useState(false)

  useEffect(() => {
    if (showSizeModal && selectedProduct) {
      const fetchSizes = async () => {
        setLoadingSizes(true)
        try {
          const slug = selectedProduct.slug || selectedProduct.id
          const response = await fetch(`/api/products/${slug}`)
          if (response.ok) {
            const data = await response.json()
            setProductSizes(data.sizes || [])
          } else {
            setProductSizes([])
          }
        } catch (error) {
          console.error('Erro ao buscar tamanhos:', error)
          setProductSizes([])
        } finally {
          setLoadingSizes(false)
        }
      }
      fetchSizes()
    } else {
      setProductSizes([])
      setSelectedSize('')
    }
  }, [showSizeModal, selectedProduct])
  useEffect(() => {
    const fetchProducts = async () => {
      if (query.trim()) {
        setLoading(true)
        try {
          const response = await fetch(`/api/products/search?q=${encodeURIComponent(query.trim())}`)
          const data = await response.json()
          if (data.success) {
            setProducts(data.data)
          } else {
            setProducts([])
          }
        } catch (error) {
          console.error('Erro na busca:', error)
          setProducts([])
        } finally {
          setLoading(false)
        }
      }
    }
    fetchProducts()
  }, [query])
  const filteredProducts = products.filter(product => {
    if (filters.minPrice && product.price < parseFloat(filters.minPrice)) return false
    if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) return false
    if (filters.category && product.category_name !== filters.category) return false
    return true
  })
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      default:
        return 0
    }
  })
  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-sand-100 relative flex items-center justify-center overflow-hidden pt-48 pb-12">
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center px-4 max-w-2xl">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="mb-8 flex justify-center"
          >
            <div className="p-6 bg-primary-50 rounded-full border border-primary-200 shadow-sm">
              <MagnifyingGlass size={64} className="text-primary-600" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-sage-900 mb-4"
          >
            Pesquisa de Produtos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-sage-800 leading-relaxed"
          >
            Digite o que você procura na barra de pesquisa para encontrar as melhores peças!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/produtos"
              className="group relative inline-flex items-center gap-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25"
            >
              <Package size={20} />
              Ver Todos os Produtos
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-sand-100 relative">
      <div className="relative z-10 pt-48 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-sage-900 mb-4">
              Resultados para: <span className="text-primary-600">&quot;{query}&quot;</span>
            </h1>
            <p className="text-sage-800">
              {loading ? 'Buscando produtos...' : `${sortedProducts.length} produto(s) encontrado(s)`}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary-50 border border-cloud-100 rounded-2xl p-4 mb-8 shadow-sm"
          >
            <div className="hidden lg:flex flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Funnel size={20} className="text-primary-600" />
                  <span className="text-sage-900 font-medium">Filtros:</span>
                </div>
                <input
                  type="number"
                  placeholder="Preço min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="bg-white border border-cloud-200 rounded-lg px-4 py-3 text-sage-900 placeholder-sage-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none w-32 text-center"
                />
                <input
                  type="number"
                  placeholder="Preço max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="bg-white border border-cloud-200 rounded-lg px-4 py-3 text-sage-900 placeholder-sage-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none w-32 text-center"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ArrowsDownUp size={20} className="text-primary-600" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-cloud-200 rounded-lg px-3 py-2 text-sage-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                  >
                    <option value="relevance">Mais Relevantes</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                    <option value="name">Nome A-Z</option>
                    <option value="rating">Melhor Avaliados</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-primary-500 text-white shadow-md' 
                        : 'bg-white border border-cloud-200 text-sage-700 hover:text-primary-600 hover:border-primary-300'
                    }`}
                  >
                    <Square size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-primary-500 text-white shadow-md' 
                        : 'bg-white border border-cloud-200 text-sage-700 hover:text-primary-600 hover:border-primary-300'
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <Funnel size={18} className="text-primary-600" />
                  </div>
                  <span className="text-sage-900 font-semibold text-lg">Filtros e Ordenação</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sage-800 text-sm font-medium">Faixa de Preço:</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Preço min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      className="w-full bg-white border-2 border-cloud-200 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none text-center font-medium"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Preço max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="w-full bg-white border-2 border-cloud-200 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none text-center font-medium"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <ArrowsDownUp size={18} className="text-primary-600" />
                  </div>
                  <span className="text-sage-800 text-sm font-medium">Ordenar por:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border-2 border-cloud-200 rounded-xl px-4 py-3 text-sage-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none font-medium"
                >
                  <option value="relevance">Mais Relevantes</option>
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                  <option value="name">Nome A-Z</option>
                  <option value="rating">Melhor Avaliados</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sage-800 text-sm font-medium">Visualização:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                      viewMode === 'grid' 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                        : 'bg-white border border-cloud-200 text-sage-700 hover:text-primary-600 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Square size={18} />
                      <span className="text-sm">Grade</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                      viewMode === 'list' 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                        : 'bg-white border border-cloud-200 text-sage-700 hover:text-primary-600 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <List size={18} />
                      <span className="text-sm">Lista</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="relative z-10 pb-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}
            >
              <AnimatePresence>
                {sortedProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="p-8 bg-primary-50 border border-cloud-100 rounded-2xl max-w-md mx-auto shadow-sm">
                <Package size={64} className="mx-auto mb-4 text-sage-500" />
                <h3 className="text-xl font-semibold text-sage-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-sage-800 mb-6">
                  Não encontramos produtos para &quot;{query}&quot;. Tente outros termos ou explore nossa coleção completa.
                </p>
                <Link
                  href="/produtos"
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Ver Todos os Produtos
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showSizeModal && selectedProduct && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white border border-cloud-100 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.22 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-sage-900 mb-2">Escolha o Tamanho</h2>
                <p className="text-sage-800">{selectedProduct.name}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {loadingSizes ? (
                  <div className="col-span-3 text-center text-sage-700 py-4">
                    Carregando tamanhos...
                  </div>
                ) : productSizes.length > 0 ? (
                  productSizes.map((sizeData: any) => {
                    const size = typeof sizeData === 'string' ? sizeData : sizeData.size
                    const available = typeof sizeData === 'object' ? sizeData.available : true
                    const isSelected = selectedSize === size
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          !available
                            ? 'border-cloud-200 bg-cloud-100 text-sage-500 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
                            : 'border-cloud-200 text-sage-800 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })
                ) : (
                  <div className="col-span-3 text-center text-sage-700 py-4">
                    Nenhum tamanho disponível para este produto
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-6 py-3 rounded-lg bg-cloud-100 text-sage-700 border border-cloud-200 hover:bg-cloud-200 transition-colors font-semibold"
                  onClick={() => {
                    setShowSizeModal(false)
                    setSelectedProduct(null)
                    setSelectedSize('')
                    setProductSizes([])
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-bold transition-all disabled:bg-cloud-200 disabled:text-sage-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  disabled={!selectedSize}
                  onClick={() => {
                    if (selectedSize) {
                      alert(`Produto ${selectedProduct.name} - Tamanho ${selectedSize} adicionado ao carrinho!`)
                      setShowSizeModal(false)
                      setSelectedProduct(null)
                      setSelectedSize('')
                      setProductSizes([])
                    }
                  }}
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-sage-800">Carregando...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}