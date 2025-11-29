'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  FaBox, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTags,
  FaStar,
  FaSpinner,
  FaExclamationTriangle,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaCheck
} from 'react-icons/fa';
import Link from 'next/link'
import CreateProductModal from '@/components/admin/CreateProductModal'
interface Product {
  id: number;
  name: string;
  category_name?: string;
  model_name?: string;
  primary_image?: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  sku: string;
  created_at?: string;
  category?: {
    name: string;
  };
  product_images?: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}
interface Model {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  is_associated?: boolean;
}
const getProductImage = (product: Product): string | null => {
  if (product.primary_image) {
    return product.primary_image;
  }
  if (product.product_images && product.product_images.length > 0) {
    const primaryImg = product.product_images.find(img => img.is_primary);
    return primaryImg?.image_url || product.product_images[0].image_url;
  }
  return null;
};
export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [newProducts, setNewProducts] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [productCategories, setProductCategories] = useState<Record<number, Category[]>>({});
  const [showCategoriesModal, setShowCategoriesModal] = useState<number | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [addingCategories, setAddingCategories] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState<Record<number, boolean>>({});
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        model: selectedModel,
        newProducts: newProducts.toString(),
        sortBy,
        sortOrder
      });
      const response = await fetch(`/api/admin/products?${params}`);
      const result = await response.json();
      if (result.success && result.data) {
        setProducts(result.data.products || []);
        setTotalPages(result.data.pagination?.pages || 1);
        setTotalProducts(result.data.pagination?.total || 0);
      } else {
        setError(result.error || 'Erro ao carregar produtos');
        setProducts([]);
      }
    } catch (error) {

      setError('Erro ao conectar com o servidor');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedModel, newProducts, sortBy, sortOrder]);
  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch('/api/models');
      const result = await response.json();
      if (result.success && result.data) {
        setModels(result.data || []);
      }
    } catch (error) {

    }
  }, []);
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      if (width < 768) {
        setViewMode('grid');
      } else if (width >= 768 && width < 1024) {
        if (viewMode === 'grid' && width >= 768) {
          setViewMode('table');
        }
      } else {
        setViewMode('table');
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [viewMode]);
  useEffect(() => {
    fetchProducts();
    fetchModels();
  }, [fetchProducts, fetchModels]);

  useEffect(() => {
    if (products.length > 0) {
      products.forEach(product => {
        if (!productCategories[product.id] && !loadingCategories[product.id]) {
          fetchProductCategories(product.id);
        }
      });
    }
  }, [products, productCategories, loadingCategories]);

  const fetchProductCategories = async (productId: number) => {
    try {
      setLoadingCategories(prev => ({ ...prev, [productId]: true }));
      const response = await fetch(`/api/admin/products/${productId}/categories`);
      const result = await response.json();
      if (result.success) {
        setProductCategories(prev => ({
          ...prev,
          [productId]: result.data || []
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias do produto:', error);
    } finally {
      setLoadingCategories(prev => ({ ...prev, [productId]: false }));
    }
  };

  const fetchAvailableCategories = async (productId: number) => {
    try {
      const params = new URLSearchParams({
        search: categorySearchTerm
      });
      const response = await fetch(`/api/admin/products/${productId}/available-categories?${params}`);
      const result = await response.json();
      if (result.success) {
        const categories = result.data?.categories || result.data || [];
        setAvailableCategories(categories);
        const associatedIds = categories
          .filter((cat: Category) => cat.is_associated)
          .map((cat: Category) => cat.id);
        setSelectedCategories(associatedIds);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias disponíveis:', error);
    }
  };

  const handleAddCategories = async (productId: number) => {
    setAddingCategories(true);
    try {
      const categoriesToAdd: number[] = [];
      const categoriesToRemove: number[] = [];
      
      availableCategories.forEach(category => {
        const isSelected = selectedCategories.includes(category.id);
        if (category.is_associated && !isSelected) {
          categoriesToRemove.push(category.id);
        } else if (!category.is_associated && isSelected) {
          categoriesToAdd.push(category.id);
        }
      });

      for (const categoryId of categoriesToAdd) {
        const response = await fetch(`/api/admin/products/${productId}/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ categoryId })
        });
        const result = await response.json();
        if (!result.success) {
          console.error('Erro ao adicionar categoria:', result.error);
        }
      }

      for (const categoryId of categoriesToRemove) {
        const response = await fetch(`/api/admin/products/${productId}/categories?categoryId=${categoryId}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (!result.success) {
          console.error('Erro ao remover categoria:', result.error);
        }
      }

      const addedCount = categoriesToAdd.length;
      const removedCount = categoriesToRemove.length;
      
      if (addedCount === 0 && removedCount === 0) {
        setAddingCategories(false);
        return;
      }
      
      let message = '';
      if (addedCount > 0 && removedCount > 0) {
        message = `${addedCount} categoria(s) adicionada(s) e ${removedCount} categoria(s) removida(s) com sucesso!`;
      } else if (addedCount > 0) {
        message = `${addedCount} categoria(s) adicionada(s) com sucesso!`;
      } else if (removedCount > 0) {
        message = `${removedCount} categoria(s) removida(s) com sucesso!`;
      }
      
      if (message) {
        alert(message);
      }
      
      await fetchProductCategories(productId);
      
      await fetchAvailableCategories(productId);
      
      setSelectedCategories([]);
      setShowCategoriesModal(null);
      setCategorySearchTerm('');
    } catch (error) {
      console.error('Erro ao atualizar categorias:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setAddingCategories(false);
    }
  };

  const handleRemoveCategory = async (productId: number, categoryId: number, categoryName: string) => {
    if (!confirm(`Tem certeza que deseja remover a categoria "${categoryName}" deste produto?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/products/${productId}/categories?categoryId=${categoryId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        fetchProductCategories(productId);
      } else {
        alert(result.error || 'Erro ao remover categoria');
      }
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      alert('Erro ao conectar com o servidor');
    }
  };
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <FaSort className="text-sage-400" />;
    return sortOrder === 'asc' ? <FaSortUp className="text-primary-500" /> : <FaSortDown className="text-primary-500" />;
  };
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Tem certeza que deseja remover este produto? Esta ação não pode ser desfeita.')) return;
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        fetchProducts();
      } else {
        alert('Erro ao remover produto: ' + result.error);
      }
    } catch (error) {

      alert('Erro ao conectar com o servidor');
    }
  };
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedModel('all');
    setNewProducts(false);
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };
  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white border border-primary-100 rounded-2xl p-4 hover:border-primary-200 transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-sand-50 border border-primary-100 flex-shrink-0">
          {getProductImage(product) ? (
            <Image
              src={getProductImage(product)!}
              alt={product.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-sand-50 flex items-center justify-center">
              <FaBox className="text-sage-400" size={24} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sage-900 font-semibold text-sm mb-1 truncate">{product.name}</h3>
          <div className="text-primary-600 font-bold text-lg">
            R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            (product.stock_quantity || 0) > 20 ? 'bg-green-500' :
            (product.stock_quantity || 0) > 10 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-xs font-medium ${
            (product.stock_quantity || 0) > 20 ? 'text-green-600' :
            (product.stock_quantity || 0) > 10 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            Estoque: {product.stock_quantity || 0}
          </span>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          product.is_active 
            ? 'bg-green-200 text-green-600 border border-green-300'
            : 'bg-red-200 text-red-600 border border-red-300'
        }`}>
          {product.is_active ? 'Ativo' : 'Inativo'}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-sage-500 mb-3">
        <span>ID: {product.id}</span>
        {product.sku && <span>SKU: {product.sku}</span>}
      </div>
      <div className="flex items-center gap-2">
        <Link 
          href={`/admin/produtos/${product.id}`} 
          className="flex-1 bg-primary-100 hover:bg-primary-200 text-primary-600 hover:text-primary-700 px-3 py-2 rounded-lg transition-all duration-300 text-center text-sm font-medium flex items-center justify-center gap-1"
        >
          <FaEye size={16} />
          Ver
        </Link>
        <Link 
          href={`/admin/produtos/${product.id}`} 
          className="flex-1 bg-primary-100 hover:bg-primary-200 text-primary-600 hover:text-primary-700 px-3 py-2 rounded-lg transition-all duration-300 text-center text-sm font-medium flex items-center justify-center gap-1"
        >
          <FaEdit size={16} />
          Editar
        </Link>
        <button 
          onClick={() => handleDeleteProduct(product.id)}
          className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg transition-all duration-300 text-center text-sm font-medium flex items-center justify-center gap-1"
        >
          <FaTrash size={16} />
          Excluir
        </button>
      </div>
    </motion.div>
  );
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-white rounded mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
          <FaExclamationTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-red-600 mb-2">Erro ao carregar produtos</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-sage-900 mb-2">Gerenciar Produtos</h1>
          <p className="text-sage-600 text-sm md:text-base">Gerencie o catálogo de produtos da sua loja</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {!isMobile && (
            <div className="flex bg-white border border-primary-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                  viewMode === 'table' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-sage-600 hover:text-primary-600'
                }`}
              >
                <FaBars size={12} />
                <span className="hidden md:inline">Tabela</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                  viewMode === 'grid' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-sage-600 hover:text-primary-600'
                }`}
              >
                <FaBox size={12} />
                <span className="hidden md:inline">Cards</span>
              </button>
            </div>
          )}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 lg:px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 flex items-center justify-center gap-2 text-sm lg:text-base whitespace-nowrap"
          >
            <FaPlus size={16} />
            <span className="hidden sm:inline">Adicionar Produto</span>
            <span className="sm:hidden">Adicionar</span>
          </button>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white border border-primary-100 rounded-2xl p-4 md:p-6"
      >
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-primary-500" size={16} />
              <span className="text-sage-900 font-medium">Filtros</span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-sage-600 hover:text-primary-600 transition-colors duration-300"
            >
              {showFilters ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
            </button>
          </div>
        )}
        <div className={`${isMobile && !showFilters ? 'hidden' : ''} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-500" size={16} />
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 pl-10 text-sage-900 placeholder-sage-500 focus:outline-none focus:border-primary-500 focus:bg-white transition-all duration-300 text-sm lg:text-base"
              />
            </div>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 focus:outline-none focus:border-primary-500 focus:bg-white transition-all duration-300 text-sm lg:text-base appearance-none"
              >
                <option value="all">Todos os Modelos</option>
                {models && models.length > 0 && models.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-500 pointer-events-none" size={14} />
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setNewProducts(!newProducts)}
                className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm lg:text-base ${
                  newProducts 
                    ? 'bg-primary-500 text-white border border-primary-500' 
                    : 'bg-white hover:bg-primary-100 border border-primary-100 hover:border-primary-200 text-sage-700 hover:text-primary-600'
                }`}
              >
                <FaStar size={16} />
                <span className="hidden sm:inline">Produtos Novos</span>
                <span className="sm:hidden">Novos</span>
              </button>
            </div>
            <div className="flex items-center">
              <button
                onClick={clearFilters}
                className="w-full bg-white hover:bg-primary-100 border border-primary-100 hover:border-primary-200 text-sage-700 hover:text-primary-600 px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm lg:text-base"
              >
                <FaFilter size={16} />
                <span className="hidden sm:inline">Limpar Filtros</span>
                <span className="sm:hidden">Limpar</span>
              </button>
            </div>
          </div>
          {isMobile && (
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-3">
              <div className="text-center text-sage-600 text-sm">
                Mostrando {products.length} de {totalProducts} produtos
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white border border-primary-100 rounded-2xl overflow-hidden"
      >
        {viewMode === 'table' ? (
          <div className="overflow-x-auto max-w-full">
            <table className="w-full min-w-max">
              <thead className="bg-primary-50 border-b border-primary-100">
                <tr>
                  <th className="px-2 lg:px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 text-sage-700 hover:text-primary-600 transition-colors duration-300 font-semibold text-xs lg:text-sm"
                    >
                      Produto
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('price')}
                      className="flex items-center gap-1 text-sage-700 hover:text-primary-600 transition-colors duration-300 font-semibold text-xs lg:text-sm"
                    >
                      Preço
                      {getSortIcon('price')}
                    </button>
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-left hidden md:table-cell">
                    <button
                      onClick={() => handleSort('stock')}
                      className="flex items-center gap-1 text-sage-700 hover:text-primary-600 transition-colors duration-300 font-semibold text-xs lg:text-sm"
                    >
                      Estoque
                      {getSortIcon('stock')}
                    </button>
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-left hidden lg:table-cell">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 text-sage-700 hover:text-primary-600 transition-colors duration-300 font-semibold text-xs lg:text-sm"
                    >
                      Status
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-left hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sage-700 font-semibold text-xs lg:text-sm">
                      <FaTags size={14} />
                      Categorias
                    </div>
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-center text-xs lg:text-sm text-sage-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {products && products.length > 0 ? products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    variants={itemVariants}
                    className="hover:bg-primary-50 transition-colors duration-300"
                  >
                    <td className="px-2 lg:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden bg-sand-50 border border-primary-100 flex-shrink-0">
                          {getProductImage(product) ? (
                            <Image
                              src={getProductImage(product)!}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-sand-50 flex items-center justify-center">
                              <FaBox className="text-sage-400" size={14} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sage-900 font-medium text-xs lg:text-sm truncate">{product.name}</div>
                          <div className="text-sage-500 text-xs">ID: {product.id}</div>
                          {product.sku && (
                            <div className="text-sage-500 text-xs">SKU: {product.sku}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 lg:px-4 py-3">
                      <span className="text-sage-900 font-semibold text-xs lg:text-sm">
                        R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </span>
                    </td>
                    <td className="px-2 lg:px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          (product.stock_quantity || 0) > 20 ? 'bg-green-500' :
                          (product.stock_quantity || 0) > 10 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`font-medium text-xs lg:text-sm ${
                          (product.stock_quantity || 0) > 20 ? 'text-green-600' :
                          (product.stock_quantity || 0) > 10 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {product.stock_quantity || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 lg:px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active 
                          ? 'bg-green-200 text-green-600 border border-green-300'
                          : 'bg-red-200 text-red-600 border border-red-300'
                      }`}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-2 lg:px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {loadingCategories[product.id] ? (
                          <FaSpinner className="animate-spin text-primary-500" size={14} />
                        ) : productCategories[product.id] && productCategories[product.id].length > 0 ? (
                          <>
                            {productCategories[product.id].map((category) => (
                              <span
                                key={category.id}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-medium border border-primary-200 group"
                              >
                                <span>{category.name}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCategory(product.id, category.id, category.name);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition-opacity"
                                  title="Remover categoria"
                                >
                                  <FaTimes size={10} />
                                </button>
                              </span>
                            ))}
                            <button
                              onClick={() => {
                                setShowCategoriesModal(product.id);
                                setCategorySearchTerm('');
                                fetchAvailableCategories(product.id);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-medium transition-colors"
                              title="Adicionar categoria"
                            >
                              <FaPlus size={10} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setShowCategoriesModal(product.id);
                              setCategorySearchTerm('');
                              fetchAvailableCategories(product.id);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-medium transition-colors"
                            title="Adicionar categoria"
                          >
                            <FaPlus size={10} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-2 lg:px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/produtos/${product.id}`} className="p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-lg transition-all duration-300">
                          <FaEye size={16} />
                        </Link>
                        <Link href={`/admin/produtos/${product.id}`} className="p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-lg transition-all duration-300">
                          <FaEdit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-300"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-sage-500">
                        <FaBox className="mx-auto mb-4 text-sage-400" size={48} />
                        <h3 className="text-lg font-medium text-sage-700 mb-2">Nenhum produto encontrado</h3>
                        <p className="text-sage-500">Tente ajustar os filtros ou adicionar novos produtos.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 lg:p-6">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-sage-500">
                  <FaBox className="mx-auto mb-4 text-sage-400" size={48} />
                  <h3 className="text-lg font-medium text-sage-700 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-sage-500">Tente ajustar os filtros ou adicionar novos produtos.</p>
                </div>
              </div>
            )}
          </div>
        )}
        {loading && products.length > 0 && (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-primary-500 mr-2" size={20} />
            <span className="text-sage-600">Carregando...</span>
          </div>
        )}
      </motion.div>
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-primary-100 rounded-2xl p-4 lg:p-6"
        >
          <div className="text-sage-600 text-sm text-center md:text-left">
            Mostrando {products.length} de {totalProducts} produtos
          </div>
          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 text-sage-600 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              <span className="hidden md:inline">Anterior</span>
              <span className="md:hidden">‹</span>
            </button>
            <div className="flex items-center gap-1">
              {(() => {
                const maxVisible = isMobile ? 3 : 5;
                const startPage = Math.max(1, page - Math.floor(maxVisible / 2));
                const endPage = Math.min(totalPages, startPage + maxVisible - 1);
                const actualStartPage = Math.max(1, endPage - maxVisible + 1);
                const pages = [];
                if (actualStartPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setPage(1)}
                      className="px-2 md:px-3 py-2 rounded-lg transition-all duration-300 text-sage-600 hover:text-primary-600 hover:bg-primary-100 text-sm md:text-base"
                    >
                      1
                    </button>
                  );
                  if (actualStartPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-sage-400 text-sm md:text-base">...</span>
                    );
                  }
                }
                for (let i = actualStartPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`px-2 md:px-3 py-2 rounded-lg transition-all duration-300 text-sm md:text-base ${
                        i === page 
                          ? 'bg-primary-500 text-white' 
                          : 'text-sage-600 hover:text-primary-600 hover:bg-primary-100'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-sage-400 text-sm md:text-base">...</span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setPage(totalPages)}
                      className="px-2 md:px-3 py-2 rounded-lg transition-all duration-300 text-sage-600 hover:text-primary-600 hover:bg-primary-100 text-sm md:text-base"
                    >
                      {totalPages}
                    </button>
                  );
                }
                return pages;
              })()}
            </div>
            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 text-sage-600 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              <span className="hidden md:inline">Próximo</span>
              <span className="md:hidden">›</span>
            </button>
          </div>
        </motion.div>
      )}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchProducts();
          setShowCreateModal(false);
        }}
      />
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl border border-primary-100 w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-primary-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
                    <FaTags className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-sage-900">Gerenciar Categorias do Produto</h3>
                    <p className="text-sm text-sage-600">Selecione ou desmarque as categorias que deseja associar</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCategoriesModal(null);
                    setSelectedCategories([]);
                    setCategorySearchTerm('');
                  }}
                  className="p-2 text-sage-400 hover:text-sage-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sage-500" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar categorias por nome..."
                    value={categorySearchTerm}
                    onChange={(e) => {
                      setCategorySearchTerm(e.target.value);
                      setTimeout(() => fetchAvailableCategories(showCategoriesModal), 300);
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-primary-50 border border-primary-100 rounded-xl text-sage-900 placeholder-sage-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {availableCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        selectedCategories.includes(category.id)
                          ? category.is_associated
                            ? 'border-primary-500 bg-primary-50 shadow-md'
                            : 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-primary-100 hover:border-primary-300 hover:shadow-sm'
                      }`}
                      onClick={() => {
                        setSelectedCategories(prev => 
                          prev.includes(category.id)
                            ? prev.filter(id => id !== category.id)
                            : [...prev, category.id]
                        );
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            selectedCategories.includes(category.id)
                              ? category.is_associated
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-primary-500 bg-primary-500'
                              : 'border-sage-300 bg-white'
                          }`}>
                            {selectedCategories.includes(category.id) && (
                              <FaCheck className="text-white text-xs" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sage-900 font-semibold text-sm truncate">{category.name}</p>
                            {category.is_associated && (
                              <span className="flex-shrink-0 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full border border-primary-200">
                                Associada
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sage-600 text-xs truncate">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTags className="text-sage-400 text-3xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-sage-900 mb-2">Nenhuma categoria disponível</h3>
                  <p className="text-sage-600 text-sm">Todas as categorias já estão associadas ou tente ajustar sua busca</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-primary-100 bg-primary-50">
              <div className="flex items-center justify-between">
                <p className="text-sage-700 font-medium text-sm">
                  {selectedCategories.length} categoria(s) selecionada(s)
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowCategoriesModal(null);
                      setSelectedCategories([]);
                      setCategorySearchTerm('');
                    }}
                    className="px-6 py-3 bg-white border border-primary-200 text-sage-700 rounded-xl hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    onClick={() => handleAddCategories(showCategoriesModal)}
                    disabled={addingCategories}
                    whileHover={{ scale: !addingCategories ? 1.02 : 1 }}
                    whileTap={{ scale: !addingCategories ? 0.98 : 1 }}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg shadow-primary-100/50"
                  >
                    {addingCategories && <FaSpinner className="animate-spin" size={16} />}
                    <span>Salvar ({selectedCategories.length})</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
