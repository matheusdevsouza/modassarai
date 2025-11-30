'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaDollarSign,
  FaExclamationTriangle,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaRedo,
  FaCheckCircle
} from 'react-icons/fa';
interface DashboardStats {
  products: {
    total: number;
    totalStock: number;
    averagePrice: number;
    lowStockCount: number;
  };
  orders: {
    total: number;
    totalRevenue: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  users: {
    total: number;
    newThisPeriod: number;
  };
  revenue: {
    current: number;
    previous: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  recentActivity: {
    orders: Array<{
      id: number;
      orderNumber: string;
      customerName: string;
      total: number;
      status: string;
      createdAt: string;
    }>;
    products: Array<{
      id: number;
      name: string;
      price: number;
      createdAt: string;
    }>;
  };
}
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/dashboard?period=${period}`);
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
        setLastUpdate(new Date());
      } else {
        setError(result.error || 'Erro ao carregar estatísticas');
      }
    } catch (error) {

      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [period]);
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);
  const refreshStats = () => {
    fetchDashboardStats();
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-sage-400';
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
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
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
          <FaExclamationTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-red-600 mb-2">Erro ao carregar dashboard</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refreshStats}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }
  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-sage-600">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }
  const statsCards = [
    {
      title: 'Total de Produtos',
      value: stats?.products?.total?.toLocaleString('pt-BR') || '0',
      change: stats?.products?.lowStockCount > 0 ? `${stats.products.lowStockCount} com estoque baixo` : 'Estoque OK',
      trend: stats?.products?.lowStockCount > 0 ? 'down' : 'up',
      icon: FaBox,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30'
    },
    {
      title: 'Total de Pedidos',
      value: stats?.orders?.total?.toLocaleString('pt-BR') || '0',
      change: `${stats?.orders?.pending || 0} pendentes`,
      trend: (stats?.orders?.pending || 0) > 0 ? 'up' : 'down',
      icon: FaShoppingCart,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30'
    },
    {
      title: 'Total de Usuários',
      value: stats?.users?.total?.toLocaleString('pt-BR') || '0',
      change: stats?.users?.newThisPeriod > 0 ? `+${stats.users.newThisPeriod} este período` : 'Nenhum novo',
      trend: (stats?.users?.newThisPeriod || 0) > 0 ? 'up' : 'down',
      icon: FaUsers,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30'
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats?.revenue?.current?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
      change: `${(stats?.revenue?.change || 0) >= 0 ? '+' : ''}${(stats?.revenue?.change || 0).toFixed(1)}%`,
      trend: stats?.revenue?.changeType || 'up',
      icon: FaDollarSign,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30'
    }
  ];
  const alerts = [
    ...((stats?.products?.lowStockCount || 0) > 0 ? [{
      type: 'warning',
      title: 'Produtos com Estoque Baixo',
      message: `${stats?.products?.lowStockCount || 0} produtos precisam de reposição`,
      description: 'Verifique o estoque para evitar indisponibilidade',
      icon: FaExclamationTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100'
    }] : []),
    ...((stats?.orders?.pending || 0) > 0 ? [{
      type: 'info',
      title: 'Pedidos Pendentes',
      message: `${stats?.orders?.pending || 0} pedidos aguardando processamento`,
      description: 'Atualize o status dos pedidos para manter os clientes informados',
      icon: FaChartLine,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-primary-100'
    }] : [])
  ];
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
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-sage-900 mb-1">Dashboard</h1>
          <p className="text-sage-600 text-sm">Visão geral da sua loja</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-primary-100 rounded-lg px-3 py-2 text-sage-900 text-sm focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
          >
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
          </select>
          <button
            onClick={refreshStats}
            className="p-2 text-sage-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
            title="Atualizar dados"
          >
                            <FaRedo size={16} />
          </button>
          <div className="text-right">
            <div className="text-xs text-sage-500">Última atualização</div>
            <div className="text-sage-900 font-medium text-sm">
              {lastUpdate.toLocaleDateString('pt-BR')}, {lastUpdate.toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            className="group relative bg-white border border-primary-100 rounded-xl p-4 hover:border-primary-300 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-all duration-300 border border-primary-200">
                <stat.icon className="text-primary-600 text-lg" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                {stat.trend === 'up' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                {stat.change}
              </div>
            </div>
            <div className="mb-2">
              <div className="text-xl font-bold text-sage-900">{stat.value}</div>
              <div className="text-xs text-sage-600">{stat.title}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-3 space-y-3"
        >
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <motion.div
                key={alert.title}
                variants={itemVariants}
                className="bg-white border border-primary-100 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${alert.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <alert.icon className={`${alert.color} text-lg`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`${alert.color} font-semibold text-base mb-1`}>{alert.title}</h3>
                    <p className="text-sage-900 font-medium text-sm mb-1">{alert.message}</p>
                    <p className="text-sage-600 text-xs">{alert.description}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              variants={itemVariants}
              className="bg-white border border-primary-100 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaCheckCircle className="text-green-600 text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-green-600 font-semibold text-base mb-1">Tudo em ordem!</h3>
                  <p className="text-sage-900 font-medium text-sm mb-1">Nenhum alerta crítico no momento</p>
                  <p className="text-sage-600 text-xs">Sua loja está funcionando perfeitamente</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white border border-primary-100 rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-sage-900">Atividade Recente</h3>
          <button className="text-primary-600 hover:text-primary-700 text-xs font-medium transition-colors duration-300">
            Ver todas
          </button>
        </div>
        <div className="space-y-3">
          {stats?.recentActivity?.orders?.map((order, index) => (
            <motion.div
              key={`order-${order.id}`}
              variants={itemVariants}
              className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-100"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(order.status)}`}></div>
              <div className="flex-1 min-w-0">
                <div className="text-sage-900 font-medium text-sm">
                  Pedido {order.orderNumber} - {order.customerName}
                </div>
                <div className="text-sage-600 text-xs">
                  R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • {getStatusLabel(order.status)}
                </div>
              </div>
              <div className="text-sage-500 text-xs">
                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </motion.div>
          ))}
          {stats?.recentActivity?.products?.map((product, index) => (
            <motion.div
              key={`product-${product.id}`}
              variants={itemVariants}
              className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-100"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sage-900 font-medium text-sm">
                  {product.name || 'Produto sem nome'}
                </div>
                <div className="text-sage-600 text-xs">
                  R$ {(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-sage-500 text-xs">
                {product.createdAt ? new Date(product.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
