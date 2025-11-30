'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaSave, 
  FaImage, 
  FaSpinner,
  FaExclamationTriangle,
  FaUpload,
  FaTimes,
  FaEdit,
  FaCheckCircle,
  FaTags,
  FaSortNumericDown,
  FaToggleOn,
  FaBox,
  FaPlus,
  FaSearch,
  FaCheck
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

interface FormData {
  name: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
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

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt(params.id as string);
  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    image_url: '',
    sort_order: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [products, setProducts] = useState<Array<{
    id: number;
    name: string;
    slug: string;
    price: number;
    stock_quantity: number;
    is_active: boolean;
    brand_name?: string;
    primary_image?: string;
    categories: Array<{ id: number; name: string; slug: string }>;
    isAssociated: boolean;
  }>>([]);
  const [allCategories, setAllCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoriesModal, setShowCategoriesModal] = useState<number | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: number; name: string; slug: string; description?: string; is_associated?: boolean }>>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [addingCategories, setAddingCategories] = useState(false);
  const [removingCategoryFromProduct, setRemovingCategoryFromProduct] = useState<number | null>(null);

  const fetchCategory = useCallback(async () => {
    try {
      const [response, productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/models/${categoryId}`),
        fetch(`/api/admin/categories/${categoryId}/products`),
        fetch(`/api/admin/categories`)
      ]);
      const result = await response.json();
      if (result.success) {
        const categoryData = result.data;
        setCategory(categoryData);
        setFormData({
          name: categoryData.name || '',
          description: categoryData.description || '',
          image_url: categoryData.image_url || '',
          sort_order: categoryData.sort_order || 0,
          is_active: categoryData.is_active
        });
        setImagePreview(categoryData.image_url || null);
      } else {
        setError(result.error || 'Erro ao carregar categoria');
      }
      if (productsRes.ok) {
        const productsJson = await productsRes.json();
        if (productsJson.success) {
          setProducts(productsJson.data || []);
        }
      }
      if (categoriesRes.ok) {
        const categoriesJson = await categoriesRes.json();
        if (categoriesJson.success) {
          setAllCategories(categoriesJson.data.categories || categoriesJson.data || []);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar categoria:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  const refreshProducts = useCallback(async () => {
    try {
      const productsRes = await fetch(`/api/admin/categories/${categoryId}/products`);
      if (productsRes.ok) {
        const productsJson = await productsRes.json();
        if (productsJson.success) {
          setProducts(productsJson.data || []);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar produtos:', error);
    }
  }, [categoryId]);

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
          .filter((cat: any) => cat.is_associated)
          .map((cat: any) => cat.id);
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
      
      await refreshProducts();
      
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

  useEffect(() => {
    if (isNaN(categoryId)) {
      setError('ID da categoria inválido');
      setLoading(false);
      return;
    }
    fetchCategory();
  }, [categoryId, fetchCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Nome da categoria é obrigatório');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/models/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || 'Erro ao atualizar categoria');
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setSaving(false);
    }
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

  if (error && !category) {
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
            <p className="text-sage-600 mb-6">{error}</p>
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

  if (!category) return null;

  const hasExistingImage = Boolean(imagePreview || formData.image_url);

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
            onClick={() => router.push(`/admin/categorias/${categoryId}`)} 
            className="inline-flex items-center gap-2 text-sage-600 hover:text-primary-600 transition-colors duration-300 mb-4 group"
          >
            <FaArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" /> 
            <span>Voltar</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-2">
                Editar Categoria #{category.id}
              </h1>
              <p className="text-sage-600 text-sm sm:text-base">
                {category.name}
              </p>
            </div>
            <motion.button
              onClick={handleSubmit}
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
            <FaExclamationTriangle className="text-red-600 flex-shrink-0" size={20} />
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
                  <FaTags className="text-primary-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-sage-900">Informações Básicas</h2>
                  <p className="text-sm text-sage-600">Dados principais da categoria</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                  placeholder="Ex: Vestidos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300 resize-none"
                  placeholder="Descreva a categoria em detalhes..."
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Ordem de Exibição
                  </label>
                  <div className="relative">
                    <FaSortNumericDown className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-500" size={16} />
                    <input
                      type="number"
                      name="sort_order"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full bg-primary-50 border border-primary-100 rounded-xl pl-10 pr-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-sage-500 text-xs mt-1">
                    Menor número aparece primeiro
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Status da Categoria
                  </label>
                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="true">✅ Ativo</option>
                    <option value="false">❌ Inativo</option>
                  </select>
                  <p className="text-sage-500 text-xs mt-1">
                    Categorias inativas não aparecem no site
                  </p>
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
                  <FaImage className="text-primary-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-sage-900">Imagem da Categoria</h2>
                  <p className="text-sm text-sage-600">Imagem principal da categoria</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative aspect-video bg-primary-50 border border-primary-100 rounded-xl overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      onError={() => setImagePreview(null)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image_url: '' }));
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                )}
                <div className={`border-2 border-dashed rounded-xl p-6 ${hasExistingImage ? 'border-primary-300 bg-primary-50' : 'border-primary-200 bg-primary-50/50'}`}>
                  <input
                    id="category-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        const data = new FormData()
                        data.append('file', file)
                        const res = await fetch(`/api/admin/models/${categoryId}/media`, { method: 'POST', body: data })
                        const result = await res.json()
                        if (result.success) {
                          setFormData(prev => ({ ...prev, image_url: result.data.image_url }))
                          setImagePreview(result.data.image_url)
                        } else {
                          setError(result.error || 'Erro ao enviar imagem')
                        }
                      } catch (err) {
                        setError('Erro ao conectar com o servidor para upload')
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasExistingImage ? 'bg-primary-200 text-primary-600' : 'bg-primary-100 text-primary-500'}`}>
                      <FaUpload size={20} />
                    </div>
                    <div className="text-sage-600 text-sm">
                      {hasExistingImage ? 'Arraste uma nova imagem aqui ou' : 'Arraste a imagem aqui ou'}
                    </div>
                    <label
                      htmlFor="category-image-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white cursor-pointer transition-colors text-sm bg-primary-500 hover:bg-primary-600 shadow-md hover:shadow-lg"
                    >
                      <FaUpload size={14} />
                      {hasExistingImage ? 'Selecionar Nova Imagem' : 'Selecionar Imagem'}
                    </label>
                    <p className="text-sage-500 text-xs">JPG, PNG, WebP • até 20MB</p>
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
                  <FaBox className="text-primary-600" size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-sage-900">Gerenciar Produtos</h2>
                  <p className="text-sm text-sage-600">Associe produtos a esta categoria e gerencie suas categorias</p>
                </div>
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-primary-100 text-primary-600 border border-primary-200">
                  {products.filter(p => p.isAssociated).length} associado{products.filter(p => p.isAssociated).length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar produtos por nome, marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-primary-50 border border-primary-100 rounded-xl text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-sage-700">Produto</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-sage-700">Preço</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-sage-700">Estoque</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-sage-700">Categorias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(p => {
                        if (!searchTerm) return true;
                        const search = searchTerm.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(search) ||
                          p.brand_name?.toLowerCase().includes(search) ||
                          p.slug.toLowerCase().includes(search)
                        );
                      })
                      .map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-primary-100 hover:bg-primary-50/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-primary-100 flex-shrink-0">
                                {product.primary_image ? (
                                  <Image
                                    src={product.primary_image}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sage-300">
                                    <FaImage size={16} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sage-900 text-sm font-medium truncate">{product.name}</p>
                                {product.brand_name && (
                                  <p className="text-sage-500 text-xs truncate">{product.brand_name}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sage-900 text-sm font-medium">
                              R$ {Number(product.price || 0).toFixed(2).replace('.', ',')}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.stock_quantity}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {Array.isArray(product.categories) && product.categories.length > 0 ? (
                                <>
                                  {product.categories.map((category) => (
                                    <span
                                      key={category.id}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-medium border border-primary-200 group"
                                    >
                                      <span>{category.name}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (removingCategoryFromProduct === product.id) return;
                                          setRemovingCategoryFromProduct(product.id);
                                          fetch(`/api/admin/products/${product.id}/categories?categoryId=${category.id}`, {
                                            method: 'DELETE'
                                          }).then(res => res.json()).then(json => {
                                            if (json.success) {
                                              refreshProducts();
                                            } else {
                                              setError(json.error || 'Erro ao remover categoria');
                                            }
                                            setRemovingCategoryFromProduct(null);
                                          }).catch(() => {
                                            setError('Erro ao conectar com o servidor');
                                            setRemovingCategoryFromProduct(null);
                                          });
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition-opacity"
                                        title="Remover categoria"
                                      >
                                        {removingCategoryFromProduct === product.id ? (
                                          <FaSpinner className="animate-spin" size={10} />
                                        ) : (
                                          <FaTimes size={10} />
                                        )}
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
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-lg text-xs font-medium transition-colors border border-primary-200"
                                  title="Adicionar categoria"
                                >
                                  <FaPlus size={10} />
                                  <span>Adicionar</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {products.filter(p => {
                  if (!searchTerm) return true;
                  const search = searchTerm.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(search) ||
                    p.brand_name?.toLowerCase().includes(search) ||
                    p.slug.toLowerCase().includes(search)
                  );
                }).length === 0 && (
                  <div className="text-center py-12">
                    <FaBox className="text-4xl text-sage-300 mx-auto mb-3" />
                    <p className="text-sage-600 mb-2">
                      {searchTerm ? 'Nenhum produto encontrado com essa busca.' : 'Nenhum produto cadastrado.'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Limpar busca
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="fixed bottom-6 right-6 sm:hidden z-50">
          <motion.button
            onClick={handleSubmit}
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
