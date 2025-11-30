'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaImage, 
  FaBox, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaPlus, 
  FaSearch, 
  FaCheck, 
  FaTimes,
  FaTags,
  FaInfoCircle,
  FaCalendarAlt,
  FaSortNumericDown,
  FaToggleOn,
  FaDollarSign,
  FaWarehouse
} from 'react-icons/fa';
import Image from 'next/image';
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}
interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  brand_name: string;
  primary_image?: string;
}
interface AvailableProduct extends Product {
  current_category_name?: string;
  category_id?: number;
}
export default function CategoryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt(params.id as string);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProducts, setShowAddProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [addingProducts, setAddingProducts] = useState(false);
  const fetchCategoryDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`);
      const result = await response.json();
      if (result.success) {
        setCategory(result.data);
      } else {
        setError(result.error || 'Erro ao carregar categoria');
      }
    } catch (error) {
      console.error('Erro ao carregar categoria:', error);
      setError('Erro ao conectar com o servidor');
    }
  }, [categoryId]);
  const fetchCategoryProducts = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/products`);
      const result = await response.json();
      if (result.success) {
        const associatedProducts = (result.data || []).filter((p: any) => p.isAssociated === true);
        setProducts(associatedProducts);
      } else {
        console.error('Erro ao carregar produtos da categoria:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos da categoria:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);
  useEffect(() => {
    if (isNaN(categoryId)) {
      setError('ID da categoria inválido');
      setLoading(false);
      return;
    }
    fetchCategoryDetails();
    fetchCategoryProducts();
  }, [categoryId, fetchCategoryDetails, fetchCategoryProducts]);
  const fetchAvailableProducts = async () => {
    try {
      const params = new URLSearchParams({
        excludeCategoryId: categoryId.toString(),
        search: searchTerm,
        limit: '50'
      });
      const response = await fetch(`/api/admin/categories/available-products?${params}`);
      const result = await response.json();
      if (result.success) {
        setAvailableProducts(result.data?.products || result.data || []);
      } else {
        console.error('Erro ao carregar produtos disponíveis:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos disponíveis:', error);
    }
  };
  const handleAddProducts = async () => {
    if (selectedProducts.length === 0) return;
    setAddingProducts(true);
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productIds: selectedProducts
        })
      });
      const result = await response.json();
      if (result.success) {
        alert(`${selectedProducts.length} produto(s) adicionado(s) com sucesso!`);
        setSelectedProducts([]);
        setShowAddProducts(false);
        fetchCategoryProducts();
        fetchCategoryDetails(); 
      } else {
        alert(result.error || 'Erro ao adicionar produtos');
      }
    } catch (error) {
      console.error('Erro ao adicionar produtos:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setAddingProducts(false);
    }
  };
  const handleRemoveProduct = async (productId: number, productName: string) => {
    if (!confirm(`Tem certeza que deseja remover "${productName}" desta categoria?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/products`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productIds: [productId]
        })
      });
      const result = await response.json();
      if (result.success) {
        alert('Produto removido com sucesso!');
        fetchCategoryProducts();
        fetchCategoryDetails(); 
      } else {
        alert(result.error || 'Erro ao remover produto');
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      alert('Erro ao conectar com o servidor');
    }
  };
  const handleDeleteCategory = async () => {
    if (!category) return;
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        alert('Categoria excluída com sucesso!');
        router.push('/admin/categorias');
      } else {
        alert(result.error || 'Erro ao excluir categoria');
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao conectar com o servidor');
    }
  };
  const getCategoryImage = (category: Category) => {
    if (category.image_url) {
      if (category.image_url.startsWith('/api/categories/images/')) {
        return category.image_url;
      }
      return category.image_url;
    }
    return null;
  };
  const getProductImage = (product: Product | AvailableProduct) => {
    if (product.primary_image) {
      return product.primary_image;
    }
    return null;
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-2 border-transparent border-b-primary-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
      </div>
    );
  }
  if (error || !category) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-red-200 rounded-2xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-red-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-sage-900 mb-2">Erro ao carregar categoria</h3>
            <p className="text-sage-600 mb-6">{error || 'Categoria não encontrada'}</p>
            <button
              onClick={() => router.push('/admin/categorias')}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
            >
              Voltar para Categorias
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
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
            onClick={() => router.push('/admin/categorias')}
            className="inline-flex items-center gap-2 text-sage-600 hover:text-primary-600 transition-colors duration-300 mb-4 group"
          >
            <FaArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Voltar</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-2">
                {category.name}
              </h1>
              <p className="text-sage-600 text-sm sm:text-base">
                Detalhes da categoria
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => router.push(`/admin/categorias/${categoryId}/editar`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-100/50"
              >
                <FaEdit size={16} />
                <span>Editar</span>
              </motion.button>
              <motion.button
                onClick={handleDeleteCategory}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-100/50"
              >
                <FaTrash size={16} />
                <span>Excluir</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
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
                  <FaTags className="text-primary-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-sage-900">Informações da Categoria</h2>
                  <p className="text-sm text-sage-600">Dados principais da categoria</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="aspect-video bg-primary-50 border border-primary-100 rounded-xl overflow-hidden">
                    {getCategoryImage(category) ? (
                      <Image
                        src={getCategoryImage(category)!}
                        alt={category.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaImage className="text-sage-400 text-4xl" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">Nome</label>
                      <p className="text-sage-900 font-medium text-lg">{category.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">Slug</label>
                      <p className="text-sage-600 font-mono text-sm bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                        {category.slug}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">Status</label>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                        category.is_active
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <FaToggleOn className={`mr-2 ${category.is_active ? 'text-green-600' : 'text-red-600'}`} size={16} />
                        {category.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">Ordem de Exibição</label>
                      <div className="flex items-center gap-2">
                        <FaSortNumericDown className="text-sage-500" size={16} />
                        <p className="text-sage-900 font-medium">{category.sort_order}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">Produtos Associados</label>
                      <div className="flex items-center gap-2">
                        <FaBox className="text-primary-500" size={16} />
                        <p className="text-sage-900 font-semibold text-lg">{category.product_count}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">Criado em</label>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-sage-500" size={14} />
                        <p className="text-sage-600 text-sm">
                          {new Date(category.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  {category.description && (
                    <div className="mt-6 pt-6 border-t border-primary-100">
                      <label className="block text-sm font-medium text-sage-700 mb-2 flex items-center gap-2">
                        <FaInfoCircle className="text-primary-500" size={14} />
                        Descrição
                      </label>
                      <p className="text-sage-700 leading-relaxed bg-primary-50 px-4 py-3 rounded-lg border border-primary-100">
                        {category.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="bg-white border border-primary-100 rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-primary-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
                    <FaBox className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-sage-900">
                      Produtos Associados
                    </h2>
                    <p className="text-sm text-sage-600">
                      Gerencie os produtos desta categoria
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => {
                    setShowAddProducts(true);
                    fetchAvailableProducts();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-100/50"
                >
                  <FaPlus size={16} />
                  <span>Adicionar Produtos</span>
                </motion.button>
              </div>
            </div>
            <div className="p-6">
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary-50 border border-primary-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="aspect-video bg-primary-100 relative overflow-hidden">
                        {getProductImage(product) ? (
                          <Image
                            src={getProductImage(product)!}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaBox className="text-sage-400 text-3xl" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sage-900 font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sage-600 text-xs mb-2">{product.brand_name}</p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-primary-600 font-bold text-sm flex items-center gap-1">
                            <FaDollarSign size={12} />
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-sage-600 text-xs flex items-center gap-1">
                            <FaWarehouse size={12} />
                            {product.stock_quantity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                            product.is_active
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {product.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                          <button
                            onClick={() => handleRemoveProduct(product.id, product.name)}
                            className="p-2 text-sage-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Remover da categoria"
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaBox className="text-sage-400 text-4xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-sage-900 mb-2">
                    Nenhum produto associado
                  </h3>
                  <p className="text-sage-600 mb-6">
                    Adicione produtos a esta categoria para começar
                  </p>
                  <motion.button
                    onClick={() => {
                      setShowAddProducts(true);
                      fetchAvailableProducts();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-100/50"
                  >
                    <FaPlus size={16} />
                    <span>Adicionar Produtos</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
        {showAddProducts && (
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
                      <h3 className="text-xl font-bold text-sage-900">Adicionar Produtos à Categoria</h3>
                      <p className="text-sm text-sage-600">Selecione os produtos que deseja associar</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddProducts(false);
                      setSelectedProducts([]);
                      setSearchTerm('');
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
                      placeholder="Buscar produtos por nome ou marca..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setTimeout(() => fetchAvailableProducts(), 300);
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-primary-50 border border-primary-100 rounded-xl text-sage-900 placeholder-sage-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                {availableProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          selectedProducts.includes(product.id)
                            ? 'border-primary-500 bg-primary-50 shadow-md'
                            : 'border-primary-100 hover:border-primary-300 hover:shadow-sm'
                        }`}
                        onClick={() => {
                          setSelectedProducts(prev => 
                            prev.includes(product.id)
                              ? prev.filter(id => id !== product.id)
                              : [...prev, product.id]
                          );
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              selectedProducts.includes(product.id)
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-sage-300 bg-white'
                            }`}>
                              {selectedProducts.includes(product.id) && (
                                <FaCheck className="text-white text-xs" />
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-primary-100">
                            {getProductImage(product) ? (
                              <Image
                                src={getProductImage(product)!}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="w-16 h-16 object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center">
                                <FaBox className="text-sage-400" size={24} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sage-900 font-semibold text-sm truncate mb-1">{product.name}</p>
                            <p className="text-sage-600 text-xs mb-2">{product.brand_name}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-primary-600 font-bold text-sm flex items-center gap-1">
                                <FaDollarSign size={10} />
                                {formatPrice(product.price)}
                              </span>
                              {product.current_category_name && (
                                <span className="text-yellow-600 text-xs bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
                                  {product.current_category_name}
                                </span>
                              )}
                            </div>
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
                    <h3 className="text-lg font-semibold text-sage-900 mb-2">Nenhum produto disponível</h3>
                    <p className="text-sage-600 text-sm">Todas os produtos já estão associados ou tente ajustar sua busca</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-primary-100 bg-primary-50">
                <div className="flex items-center justify-between">
                  <p className="text-sage-700 font-medium text-sm">
                    {selectedProducts.length} produto(s) selecionado(s)
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowAddProducts(false);
                        setSelectedProducts([]);
                        setSearchTerm('');
                      }}
                      className="px-6 py-3 bg-white border border-primary-200 text-sage-700 rounded-xl hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 font-medium"
                    >
                      Cancelar
                    </button>
                    <motion.button
                      onClick={handleAddProducts}
                      disabled={selectedProducts.length === 0 || addingProducts}
                      whileHover={{ scale: selectedProducts.length > 0 && !addingProducts ? 1.02 : 1 }}
                      whileTap={{ scale: selectedProducts.length > 0 && !addingProducts ? 0.98 : 1 }}
                      className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg shadow-primary-100/50"
                    >
                      {addingProducts && <FaSpinner className="animate-spin" size={16} />}
                      <span>Adicionar ({selectedProducts.length})</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

