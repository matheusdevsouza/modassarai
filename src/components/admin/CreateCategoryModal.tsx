'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTimes, 
  FaSave, 
  FaSpinner, 
  FaImage,
  FaUpload,
  FaTags,
  FaSortNumericDown,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import Image from 'next/image';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function CreateCategoryModal({ isOpen, onClose, onSuccess }: CreateCategoryModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    image_url: '',
    sort_order: 0,
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image_url: url }));
    if (url) {
      setImagePreview(url);
    }
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
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
          onSuccess();
        }, 1500);
      } else {
        setError(result.error || 'Erro ao criar categoria');
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      sort_order: 0,
      is_active: true
    });
    setImagePreview(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const hasExistingImage = Boolean(imagePreview || formData.image_url);

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-primary-100 bg-primary-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
                <FaTags className="text-primary-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-sage-900">Criar Nova Categoria</h2>
                <p className="text-sm text-sage-600">Preencha os dados para criar uma nova categoria</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-sage-400 hover:text-sage-600 hover:bg-primary-100 rounded-lg transition-colors"
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
              <span className="text-green-600 font-medium">Categoria criada com sucesso!</span>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={itemVariants}
                className="bg-white border border-primary-100 rounded-2xl overflow-hidden mb-6"
              >
                <div className="p-6 border-b border-primary-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
                      <FaTags className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-sage-900">Informações Básicas</h3>
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
                      <h3 className="text-xl font-semibold text-sage-900">Imagem da Categoria</h3>
                      <p className="text-sm text-sage-600">Adicione uma imagem para a categoria</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="aspect-video bg-primary-50 rounded-lg overflow-hidden border border-primary-100 mb-4">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
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
                          className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <FaImage className="text-sage-400 text-4xl mx-auto mb-2" />
                          <p className="text-sage-400 text-sm">Nenhuma imagem selecionada</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sage-700 text-sm font-semibold mb-2">
                        {hasExistingImage ? 'Substituir Imagem' : 'Upload da Imagem'}
                      </label>
                      <div className={`border-2 border-dashed rounded-xl p-6 ${hasExistingImage ? 'border-red-600/60 bg-red-500/5' : 'border-primary-300/70 bg-primary-50/30'}`}>
                        <input
                          id="create-category-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const data = new FormData()
                              data.append('file', file)
                              const localUrl = URL.createObjectURL(file)
                              setImagePreview(localUrl)
                            } catch (err) {
                              setError('Erro ao processar imagem')
                            }
                          }}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasExistingImage ? 'bg-red-500/20 text-red-600' : 'bg-primary-200 text-primary-600'}`}>
                            <FaUpload />
                          </div>
                          <div className="text-sage-600 text-sm">
                            {hasExistingImage ? 'Arraste a nova imagem aqui ou' : 'Arraste a imagem aqui ou'}
                          </div>
                          <label
                            htmlFor="create-category-image-upload"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white cursor-pointer transition-colors text-sm ${hasExistingImage ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-500 hover:bg-primary-600'}`}
                          >
                            <FaUpload />
                            {hasExistingImage ? 'Selecionar Nova Imagem' : 'Selecionar Imagem'}
                          </label>
                          <p className="text-sage-500 text-xs">JPG, PNG, WebP • até 20MB</p>
                          {hasExistingImage && (
                            <p className="text-red-600/80 text-xs mt-1">Ao enviar, a imagem atual será substituída imediatamente.</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="image_url" className="block text-sm font-medium text-sage-700 mb-2">
                        URL da Imagem (opcional)
                      </label>
                      <input
                        type="url"
                        id="image_url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleImageUrlChange}
                        className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-300"
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                      <p className="text-sage-500 text-xs mt-1">
                        Ou forneça uma URL direta para a imagem
                      </p>
                    </div>
                  </div>
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
              className="px-6 py-3 bg-primary-100 hover:bg-primary-200 text-sage-700 rounded-xl font-medium transition-all duration-300"
            >
              Cancelar
            </button>
            <motion.button
              onClick={handleSubmit}
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary-100/50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" size={16} />
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <FaSave size={16} />
                  <span>Criar Categoria</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
