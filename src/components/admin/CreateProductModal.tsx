'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaSave, 
  FaUpload, 
  FaSpinner, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaImage,
  FaBox,
  FaDollarSign,
  FaStar,
  FaInfoCircle,
  FaTags,
  FaWarehouse,
  FaSortNumericDown
} from 'react-icons/fa';
import Image from 'next/image';

interface Category {
  id: number;
  name: string;
  image_url?: string;
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  original_price: string;
  stock_quantity: string;
  min_stock_level: string;
  category_id: string;
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

export default function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    short_description: '',
    sku: '',
    price: '',
    original_price: '',
    stock_quantity: '0',
    min_stock_level: '5',
    category_id: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const categoriesRes = await fetch('/api/admin/categories');
      const categoriesData = await categoriesRes.json();
      if (categoriesData.success) {
        setCategories(categoriesData.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do formulário');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const newImages: File[] = [];
    const newPreviews: string[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        newImages.push(file);
        const preview = URL.createObjectURL(file);
        newPreviews.push(preview);
      }
    });
    setImages(prev => [...prev, ...newImages]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    if (primaryImageIndex === null && newPreviews.length > 0) {
      setPrimaryImageIndex(0);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      if (primaryImageIndex === index) {
        setPrimaryImageIndex(newPreviews.length > 0 ? 0 : null);
      } else if (primaryImageIndex !== null && primaryImageIndex > index) {
        setPrimaryImageIndex(primaryImageIndex - 1);
      }
      return newPreviews;
    });
  };

  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Nome do produto é obrigatório';
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Preço deve ser maior que zero';
    if (!formData.category_id) return 'Categoria é obrigatória';
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) return 'Quantidade em estoque deve ser maior ou igual a zero';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        min_stock_level: parseInt(formData.min_stock_level),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        slug: generateSlug(formData.name),
        is_active: true, 
        is_featured: false 
      };
      const productResponse = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const productResult = await productResponse.json();
      if (!productResult.success) {
        throw new Error(productResult.error || 'Erro ao criar produto');
      }
      const productId = productResult?.product?.id || productResult?.data?.id;
      if (images.length > 0) {
        const formDataUpload = new FormData();
        images.forEach((image) => {
          formDataUpload.append('files', image);
        });
        formDataUpload.append('type', 'image');
        formDataUpload.append('isPrimary', primaryImageIndex?.toString() || '0');
        const imageResponse = await fetch(`/api/admin/products/${productId}/media`, {
          method: 'POST',
          body: formDataUpload
        });
        const imageResult = await imageResponse.json();
        if (!imageResult.success) {
          console.warn('Erro ao fazer upload das imagens:', imageResult.error);
        }
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      setError(error.message || 'Erro ao criar produto');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      short_description: '',
      sku: '',
      price: '',
      original_price: '',
      stock_quantity: '0',
      min_stock_level: '5',
      category_id: ''
    });
    setImages([]);
    setImagePreviews([]);
    setPrimaryImageIndex(null);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b border-primary-100 bg-primary-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
                  <FaBox className="text-primary-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sage-900">Criar Novo Produto</h2>
                  <p className="text-sm text-sage-600">Preencha os dados para criar um novo produto</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={saving}
                className="p-2 text-sage-400 hover:text-sage-600 hover:bg-primary-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-primary-50">
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 bg-green-200 border border-green-300 rounded-xl p-4 flex items-center gap-3"
              >
                <FaCheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <span className="text-green-600 font-medium">Produto criado com sucesso!</span>
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

            <form onSubmit={handleSubmit}>
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
                        <FaInfoCircle className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-sage-900">Informações Básicas</h3>
                        <p className="text-sm text-sage-600">Dados principais do produto</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        Nome do Produto *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                        placeholder="Ex: Vestido Midi Lumière"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-2">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={(e) => handleInputChange('sku', e.target.value)}
                          className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                          placeholder="Ex: VEST-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-2">
                          Categoria *
                        </label>
                        <select
                          value={formData.category_id}
                          onChange={(e) => handleInputChange('category_id', e.target.value)}
                          className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
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
                        <h3 className="text-xl font-semibold text-sage-900">Preços e Estoque</h3>
                        <p className="text-sm text-sage-600">Configure os valores e disponibilidade</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-2">
                          Preço de Venda *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-500">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className="w-full bg-primary-50 border border-primary-100 rounded-xl pl-10 pr-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                            placeholder="0,00"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-2">
                          Preço Original
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-500">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.original_price}
                            onChange={(e) => handleInputChange('original_price', e.target.value)}
                            className="w-full bg-primary-50 border border-primary-100 rounded-xl pl-10 pr-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                            placeholder="0,00"
                          />
                        </div>
                        <p className="text-sage-500 text-xs mt-1">
                          Deixe vazio se não houver desconto
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-2">
                          Quantidade em Estoque *
                        </label>
                        <div className="relative">
                          <FaWarehouse className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-500" size={16} />
                          <input
                            type="number"
                            min="0"
                            value={formData.stock_quantity}
                            onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                            className="w-full bg-primary-50 border border-primary-100 rounded-xl pl-10 pr-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-2">
                          Estoque Mínimo
                        </label>
                        <div className="relative">
                          <FaSortNumericDown className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-500" size={16} />
                          <input
                            type="number"
                            min="0"
                            value={formData.min_stock_level}
                            onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
                            className="w-full bg-primary-50 border border-primary-100 rounded-xl pl-10 pr-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                            placeholder="5"
                          />
                        </div>
                        <p className="text-sage-500 text-xs mt-1">
                          Alerta quando estoque estiver abaixo deste valor
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
                        <FaInfoCircle className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-sage-900">Descrições</h3>
                        <p className="text-sm text-sage-600">Informações detalhadas do produto</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        Descrição Curta
                      </label>
                      <textarea
                        value={formData.short_description}
                        onChange={(e) => handleInputChange('short_description', e.target.value)}
                        rows={2}
                        className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300 resize-none"
                        placeholder="Breve descrição do produto (máx. 500 caracteres)"
                        maxLength={500}
                      />
                      <div className="text-right text-xs text-sage-500 mt-1">
                        {formData.short_description.length}/500
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        Descrição Completa
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300 resize-none"
                        placeholder="Descrição detalhada do produto"
                      />
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
                        <h3 className="text-xl font-semibold text-sage-900">Imagens do Produto</h3>
                        <p className="text-sm text-sage-600">Adicione imagens para o produto</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${imagePreviews.length > 0 ? 'border-primary-300 bg-primary-50/30' : 'border-primary-300/70 bg-primary-50/30'}`}>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary-200 text-primary-600 flex items-center justify-center">
                          <FaUpload size={20} />
                        </div>
                        <div>
                          <p className="text-sage-900 font-medium mb-2">Clique para selecionar imagens</p>
                          <p className="text-sage-500 text-sm">Formatos: JPG, PNG, WebP, AVIF (máx. 50MB cada)</p>
                        </div>
                      </label>
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div
                            key={index}
                            className={`relative group bg-primary-50 rounded-lg overflow-hidden border-2 ${
                              primaryImageIndex === index 
                                ? 'border-primary-500 shadow-lg shadow-primary-500/20' 
                                : 'border-primary-100'
                            }`}
                          >
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                className={`p-2 rounded-full transition-colors ${
                                  primaryImageIndex === index
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                                title="Definir como principal"
                              >
                                <FaStar size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-colors"
                                title="Remover imagem"
                              >
                                <FaTimes size={14} />
                              </button>
                            </div>
                            {primaryImageIndex === index && (
                              <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Principal
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </form>
          </div>

          <div className="p-6 border-t border-primary-100 bg-white">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="px-6 py-3 bg-primary-100 hover:bg-primary-200 text-sage-700 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <motion.button
                onClick={handleSubmit}
                disabled={saving || loading}
                whileHover={{ scale: saving || loading ? 1 : 1.02 }}
                whileTap={{ scale: saving || loading ? 1 : 0.98 }}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary-100/50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" size={16} />
                    <span>Criando Produto...</span>
                  </>
                ) : (
                  <>
                    <FaSave size={16} />
                    <span>Criar Produto</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
