'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaImage,
  FaBox,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaRedo,
  FaBars,
  FaSpinner,
  FaExclamationTriangle,
  FaUsers,
  FaSortAmountDown,
  FaSortAmountUp,
  FaGripVertical,
  FaCheckCircle
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CreateCategoryModal from '@/components/admin/CreateCategoryModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  withProducts: number;
}

function SortableRow({ 
  category, 
  index, 
  router, 
  handleToggleStatus, 
  handleDelete, 
  getCategoryImage,
  canDrag
}: {
  category: Category;
  index: number;
  router: any;
  handleToggleStatus: (id: number, isActive: boolean) => void;
  handleDelete: (id: number, name: string) => void;
  getCategoryImage: (category: Category) => string | null;
  canDrag: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.tr
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`hover:bg-primary-50 transition-colors ${isDragging ? 'bg-primary-100' : ''}`}
    >
      <td className="px-4 py-4 w-12">
        {canDrag ? (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-sage-400 hover:text-primary-600 p-1 transition-colors"
            title="Arrastar para reordenar"
          >
            <FaGripVertical size={16} />
          </button>
        ) : null}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10">
            {getCategoryImage(category) ? (
              <Image
                src={getCategoryImage(category)!}
                alt={category.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-sand-50 border border-primary-100 rounded-lg flex items-center justify-center">
                <FaImage className="text-sage-400 text-lg" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sage-900 font-medium text-sm">{category.name}</p>
            <p className="text-sage-500 text-xs">{category.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-600 border border-blue-300">
          {category.product_count} produto{category.product_count !== 1 ? 's' : ''}
        </span>
      </td>
      <td className="px-4 py-4">
        <button
          onClick={() => handleToggleStatus(category.id, category.is_active)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
            category.is_active
              ? 'bg-green-200 text-green-600 border border-green-300 hover:bg-green-300'
              : 'bg-red-200 text-red-600 border border-red-300 hover:bg-red-300'
          }`}
        >
          {category.is_active ? 'Ativo' : 'Inativo'}
        </button>
      </td>
      <td className="px-4 py-4">
        <span className="text-sage-700 text-sm">{category.sort_order}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sage-700 text-sm">
          {new Date(category.created_at).toLocaleDateString('pt-BR')}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => router.push(`/admin/categorias/${category.id}`)}
            className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
            title="Visualizar"
          >
            <FaEye size={14} />
          </button>
          <button
            onClick={() => router.push(`/admin/categorias/${category.id}/editar`)}
            className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors"
            title="Editar"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => handleDelete(category.id, category.name)}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
            title="Excluir"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('sort_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalModels, setTotalModels] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isReordering, setIsReordering] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState(false);
  const router = useRouter();
  
  const canDrag = searchTerm === '' && statusFilter === 'all' && sortBy === 'sort_order';
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder
      });
      const response = await fetch(`/api/admin/categories?${params}`);
      const result = await response.json();
      if (result.success) {
        const categoriesData = result.data?.categories || result.data || [];
        setCategories(categoriesData);
        setTotalPages(result.data?.pagination?.pages || 1);
        setTotalModels(result.data?.pagination?.total || categoriesData.length);
        const stats: CategoryStats = {
          total: result.data?.pagination?.total || categoriesData.length,
          active: categoriesData.filter((c: Category) => c.is_active).length,
          inactive: categoriesData.filter((c: Category) => !c.is_active).length,
          withProducts: categoriesData.filter((c: Category) => (c.product_count || 0) > 0).length
        };
        setStats(stats);
      } else {
        setError(result.error || 'Erro ao carregar categorias');
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, sortBy, sortOrder]);
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      if (width < 768) {
        setViewMode('grid');
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  const refreshCategories = () => {
    setPage(1);
    fetchCategories();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          sort_order: index + 1
        }));
        
        setIsReordering(true);
        fetch('/api/admin/categories/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categories: updatedItems.map(item => ({
              id: item.id,
              sort_order: item.sort_order
            }))
          }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setReorderSuccess(true);
            setTimeout(() => setReorderSuccess(false), 3000);
            fetchCategories();
          } else {
            fetchCategories();
          }
        })
        .catch(error => {
          console.error('Erro ao reordenar:', error);
          fetchCategories();
        })
        .finally(() => {
          setIsReordering(false);
        });
        
        return updatedItems;
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCategories();
  };
  const handleDelete = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        alert('Categoria excluída com sucesso!');
        fetchCategories();
      } else {
        alert(result.error || 'Erro ao excluir categoria');
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao conectar com o servidor');
    }
  };
  const handleToggleStatus = async (categoryId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      });
      const result = await response.json();
      if (result.success) {
        fetchCategories();
      } else {
        alert(result.error || 'Erro ao alterar status da categoria');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
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
  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <p className="text-sage-600">Carregando categorias...</p>
        </div>
      </div>
    );
  }
  if (error && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-white border border-red-200 rounded-xl p-6">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refreshCategories}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
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
          <h1 className="text-xl md:text-2xl font-bold text-sage-900 mb-1">Gestão de Categorias</h1>
          <p className="text-sage-600 text-xs md:text-sm">Gerencie todas as categorias da sua loja</p>
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
            onClick={refreshCategories}
            disabled={loading}
            className="px-3 py-2 bg-white border border-primary-100 text-sage-600 rounded-xl hover:text-primary-600 hover:bg-primary-100 transition-all duration-300 flex items-center gap-2 text-sm"
          >
            <FaRedo className={loading ? 'animate-spin' : ''} size={12} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
          >
            <FaPlus size={12} />
            <span>Nova Categoria</span>
          </button>
        </div>
      </motion.div>
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        >
          <div className="bg-white border border-primary-100 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-600 text-xs">Total</p>
                <p className="text-lg lg:text-xl font-bold text-sage-900">
                  {stats.total}
                </p>
              </div>
              <div className="bg-primary-200 p-2 rounded-full">
                <FaBox className="text-primary-600" size={14} />
              </div>
            </div>
          </div>
          <div className="bg-white border border-primary-100 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-600 text-xs">Ativos</p>
                <p className="text-lg lg:text-xl font-bold text-sage-900">
                  {stats.active}
                </p>
              </div>
              <div className="bg-green-200 p-2 rounded-full">
                <FaUsers className="text-green-600" size={14} />
              </div>
            </div>
          </div>
          <div className="bg-white border border-primary-100 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-600 text-xs">Inativos</p>
                <p className="text-lg lg:text-xl font-bold text-sage-900">
                  {stats.inactive}
                </p>
              </div>
              <div className="bg-red-200 p-2 rounded-full">
                <FaUsers className="text-red-600" size={14} />
              </div>
            </div>
          </div>
          <div className="bg-white border border-primary-100 rounded-xl p-3 lg:p-4 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-600 text-xs">Com Produtos</p>
                <p className="text-lg lg:text-xl font-bold text-sage-900">
                  {stats.withProducts}
                </p>
              </div>
              <div className="bg-primary-200 p-2 rounded-full">
                <FaBox className="text-primary-600" size={14} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white border border-primary-100 rounded-xl p-4"
      >
        {isMobile && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-3 text-sage-900 mb-4 bg-primary-50 rounded-lg"
          >
            <span className="flex items-center gap-2">
              <FaFilter size={14} />
              Filtros
            </span>
            {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        )}
        <div className={`space-y-4 ${isMobile && !showFilters ? 'hidden' : ''}`}>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-500 text-sm" />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-primary-50 border border-primary-100 rounded-lg text-sage-900 placeholder-sage-500 focus:outline-none focus:border-primary-500 focus:bg-white text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 text-sm"
            >
              Buscar
            </button>
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-primary-50 border border-primary-100 rounded-lg text-sage-900 text-sm focus:outline-none focus:border-primary-500 focus:bg-white"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-primary-50 border border-primary-100 rounded-lg text-sage-900 text-sm focus:outline-none focus:border-primary-500 focus:bg-white"
            >
              <option value="created_at">Data de Criação</option>
              <option value="name">Nome</option>
              <option value="updated_at">Última Atualização</option>
              <option value="sort_order">Ordem de Exibição</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-primary-50 border border-primary-100 rounded-lg text-sage-700 text-sm hover:text-primary-600 hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
            >
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortBy('sort_order');
                setSortOrder('asc');
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-primary-100 rounded-lg text-sage-600 text-sm hover:text-primary-600 hover:bg-primary-100 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {reorderSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 bg-green-200 border border-green-300 rounded-xl p-4 flex items-center gap-3"
          >
            <FaCheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <span className="text-green-600 font-medium">Ordem das categorias atualizada com sucesso!</span>
          </motion.div>
        )}
        {viewMode === 'table' && !isMobile && searchTerm === '' && statusFilter === 'all' && sortBy === 'sort_order' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-primary-50 border border-primary-200 rounded-xl p-3 flex items-center gap-2"
          >
            <FaGripVertical className="text-primary-600" size={16} />
            <span className="text-sage-700 text-sm">
              <strong>Dica:</strong> Arraste as categorias pelo ícone <FaGripVertical className="inline text-sage-500" size={12} /> para reorganizar a ordem de exibição
            </span>
          </motion.div>
        )}
        {viewMode === 'table' && !isMobile ? (
          <div className="bg-white border border-primary-100 rounded-xl overflow-hidden">
            <DndContext
              sensors={canDrag ? sensors : []}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-50 border-b border-primary-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-sage-700 uppercase tracking-wider w-12">
                        {searchTerm === '' && statusFilter === 'all' && sortBy === 'sort_order' ? (
                          <FaGripVertical className="text-sage-400" size={12} />
                        ) : null}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-sage-700 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-sage-700 uppercase tracking-wider">
                        Produtos
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-sage-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-sage-700 uppercase tracking-wider">
                        Ordem
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-sage-700 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-sage-700 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <SortableContext
                    items={categories.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <tbody className="divide-y divide-primary-100">
                      {categories.map((category, index) => (
                        <SortableRow
                          key={category.id}
                          category={category}
                          index={index}
                          router={router}
                          handleToggleStatus={handleToggleStatus}
                          handleDelete={handleDelete}
                          getCategoryImage={getCategoryImage}
                          canDrag={canDrag}
                        />
                      ))}
                    </tbody>
                  </SortableContext>
                </table>
              </div>
            </DndContext>
            {isReordering && (
              <div className="p-4 bg-primary-50 border-t border-primary-100 flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin text-primary-600" size={16} />
                <span className="text-sage-600 text-sm">Atualizando ordem...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl border border-primary-100 overflow-hidden hover:border-primary-200 transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50"
              >
                <div className="aspect-video relative bg-sand-50">
                  {getCategoryImage(category) ? (
                    <Image
                      src={getCategoryImage(category)!}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaImage className="text-sage-400 text-3xl" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleStatus(category.id, category.is_active)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        category.is_active
                          ? 'bg-green-200 text-green-600 border border-green-300 hover:bg-green-300'
                          : 'bg-red-200 text-red-600 border border-red-300 hover:bg-red-300'
                      }`}
                    >
                      {category.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-sage-900 font-medium text-sm mb-1">{category.name}</h3>
                    <p className="text-sage-500 text-xs">{category.slug}</p>
                    {category.description && (
                      <p className="text-sage-500 text-xs mt-1 line-clamp-2">{category.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-600 border border-blue-300">
                      {category.product_count} produto{category.product_count !== 1 ? 's' : ''}
                    </span>
                    <span className="text-sage-500 text-xs">
                      Ordem: {category.sort_order}
                    </span>
                  </div>
                  <p className="text-sage-500 text-xs mb-3">
                    Criado em {new Date(category.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => router.push(`/admin/categorias/${category.id}`)}
                      className="px-3 py-1.5 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors text-xs flex items-center gap-1"
                    >
                      <FaEye size={12} />
                      Ver
                    </button>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => router.push(`/admin/categorias/${category.id}/editar`)}
                        className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {categories.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaBox className="text-4xl text-sage-400 mx-auto mb-4" />
            <p className="text-sage-600 mb-4">Nenhuma categoria encontrada</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Criar Primeira Categoria
            </button>
          </div>
        )}
      </motion.div>
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <p className="text-sage-600 text-sm">
            Mostrando {categories.length} de {totalModels} categorias
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 bg-white border border-primary-100 text-sage-600 rounded-lg hover:text-primary-600 hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Anterior
            </button>
            <span className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm">
              {page}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 bg-white border border-primary-100 text-sage-600 rounded-lg hover:text-primary-600 hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Próxima
            </button>
          </div>
        </motion.div>
      )}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refreshCategories}
      />
    </div>
  );
}
