"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaSpinner, 
  FaSave, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaEye, 
  FaEyeSlash, 
  FaLock, 
  FaShieldAlt, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaIdCard,
  FaTimes,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaTruck,
  FaDollarSign,
  FaCalendarAlt,
  FaBox,
  FaCreditCard,
  FaEdit
} from 'react-icons/fa'

interface OrderItem {
  id: number
  product_name: string
  quantity: number
  unit_price: number
}

interface Order {
  id: number
  order_number: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  customer_cpf?: string
  shipping_address?: string
  formatted_address?: {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
    shipping_cost: number
  }
  notes?: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: string
  subtotal: number
  shipping_cost: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  currency: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
  shipped_at?: string
  delivered_at?: string
  tracking_code?: string
  tracking_url?: string
  shipping_company?: string
  shipping_status?: string
  shipping_notes?: string
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

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: 'Pendente', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300' },
    processing: { label: 'Processando', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' },
    shipped: { label: 'Enviado', color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300' },
    delivered: { label: 'Entregue', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' },
    cancelled: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' }
  }
  return statusMap[status] || statusMap.pending
}

const getPaymentStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: 'Pendente', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300' },
    paid: { label: 'Pago', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' },
    failed: { label: 'Falhou', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' },
    refunded: { label: 'Reembolsado', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300' }
  }
  return statusMap[status] || statusMap.pending
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params?.id)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [revealedData, setRevealedData] = useState<{
    email: boolean;
    phone: boolean;
    cpf: boolean;
    address: boolean;
  }>({
    email: false,
    phone: false,
    cpf: false,
    address: false
  })
  const [showRevealModal, setShowRevealModal] = useState(false)
  const [dataToReveal, setDataToReveal] = useState<'email' | 'phone' | 'cpf' | 'address' | null>(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [revealing, setRevealing] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/orders/${id}`)
        if (!res.ok) throw new Error('Falha ao carregar pedido')
        const response = await res.json()
        const data = response.order 
        setOrder(data)
      } catch (e: any) {
        setError(e.message || 'Erro inesperado')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchOrder()
  }, [id])

  async function handleSave() {
    if (!order) return
    try {
      setSaving(true)
      setError(null)
      const requestBody = {
        status: order.status,
        payment_status: order.payment_status,
        tracking_code: order.tracking_code,
        tracking_url: order.tracking_url,
        shipping_company: order.shipping_company,
        shipping_status: order.shipping_status,
        shipping_notes: order.shipping_notes
      };

      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${res.status}: ${res.statusText}`);
      }
      const result = await res.json();

      if (result.message && result.message.includes('e-mail')) {
        setSaved(true)
        setTimeout(() => setSaved(false), 5000) 
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleRevealData(dataType: 'email' | 'phone' | 'cpf' | 'address') {
    try {
      setRevealing(true)
      setError(null)
      const res = await fetch(`/api/admin/orders/${id}/reveal-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataType,
          password: adminPassword
        })
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao revelar dados');
      }
      const result = await res.json()
      if (result.success && result.data) {
        setOrder(prevOrder => {
          if (!prevOrder) return prevOrder;
          const updatedOrder = { ...prevOrder };
          switch (dataType) {
            case 'email':
              updatedOrder.customer_email = result.data.email;
              break;
            case 'phone':
              updatedOrder.customer_phone = result.data.phone;
              break;
            case 'cpf':
              updatedOrder.customer_cpf = result.data.cpf;
              break;
            case 'address':
              updatedOrder.shipping_address = result.data.shipping_address;
              updatedOrder.formatted_address = result.data.formatted_address;
              break;
          }
          return updatedOrder;
        });
        setRevealedData(prev => ({
          ...prev,
          [dataType]: true
        }));
        setShowRevealModal(false)
        setAdminPassword('')
        setDataToReveal(null)
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao revelar dados')
    } finally {
      setRevealing(false)
    }
  }

  function openRevealModal(dataType: 'email' | 'phone' | 'cpf' | 'address') {
    setDataToReveal(dataType)
    setShowRevealModal(true)
    setAdminPassword('')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <FaSpinner className="animate-spin text-primary-500" size={24} />
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      </div>
    )
  }

  if (!order) return null

  const statusBadge = getStatusBadge(order.status)
  const paymentStatusBadge = getPaymentStatusBadge(order.payment_status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 px-3 py-2 text-sage-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 rounded-lg border border-primary-100 hover:border-primary-300"
          >
            <FaArrowLeft size={14} /> Voltar
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-sage-900">Pedido {order.order_number}</h1>
            <p className="text-sage-600 text-xs md:text-sm mt-1">
              Criado em {new Date(order.createdAt).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusBadge.bg} ${statusBadge.color} ${statusBadge.border}`}>
              {statusBadge.label}
            </span>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${paymentStatusBadge.bg} ${paymentStatusBadge.color} ${paymentStatusBadge.border}`}>
              {paymentStatusBadge.label}
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-primary-500/25 font-medium text-sm"
          >
            {saving ? <FaSpinner className="animate-spin" size={14} /> : <FaSave size={14} />} Salvar
          </button>
        </div>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl"
          >
            <FaCheckCircle size={18} />
            <span className="text-sm font-medium">
              {order?.tracking_code ? 'Alterações salvas e e-mail de rastreio enviado!' : 'Alterações salvas com sucesso'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            variants={itemVariants}
            className="bg-white border border-primary-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center border border-primary-200">
                <FaUser className="text-primary-600" size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-sage-900">Informações do Cliente</h3>
                <p className="text-xs text-sage-600">Dados pessoais e de contato</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-sage-600">
                  <FaUser size={10} className="text-primary-600" />
                  Nome Completo
                </label>
                <input 
                  value={order.customer_name || ''} 
                  disabled 
                  className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-900 text-sm focus:outline-none focus:border-primary-300 transition-colors" 
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-sage-600">
                  <FaEnvelope size={10} className="text-primary-600" />
                  Email
                </label>
                <div className="relative">
                  <input 
                    value={revealedData.email ? (order.customer_email || '') : '••••••••@•••••.com'} 
                    disabled 
                    className={`w-full bg-sage-50 border rounded-lg px-4 py-2.5 pr-12 text-sm transition-all duration-300 ${
                      revealedData.email 
                        ? 'border-primary-200 text-sage-900' 
                        : 'border-primary-100 text-sage-400'
                    }`}
                  />
                  {!revealedData.email && (
                    <button
                      onClick={() => openRevealModal('email')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm"
                      title="Revelar email completo"
                    >
                      <FaEye size={12} />
                    </button>
                  )}
                  {revealedData.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                      <FaEyeSlash size={12} />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-sage-600">
                  <FaPhone size={10} className="text-primary-600" />
                  Telefone
                </label>
                <div className="relative">
                  <input 
                    value={revealedData.phone ? (order.customer_phone || '') : '•• •••••-••••'} 
                    disabled 
                    className={`w-full bg-sage-50 border rounded-lg px-4 py-2.5 pr-12 text-sm transition-all duration-300 ${
                      revealedData.phone 
                        ? 'border-primary-200 text-sage-900' 
                        : 'border-primary-100 text-sage-400'
                    }`}
                  />
                  {!revealedData.phone && (
                    <button
                      onClick={() => openRevealModal('phone')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm"
                      title="Revelar telefone completo"
                    >
                      <FaEye size={12} />
                    </button>
                  )}
                  {revealedData.phone && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                      <FaEyeSlash size={12} />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-sage-600">
                  <FaIdCard size={10} className="text-primary-600" />
                  CPF
                </label>
                <div className="relative">
                  <input 
                    value={revealedData.cpf ? (order.customer_cpf || '') : '•••.•••.•••-••'} 
                    disabled 
                    className={`w-full bg-sage-50 border rounded-lg px-4 py-2.5 pr-12 text-sm transition-all duration-300 ${
                      revealedData.cpf 
                        ? 'border-primary-200 text-sage-900' 
                        : 'border-primary-100 text-sage-400'
                    }`}
                  />
                  {!revealedData.cpf && (
                    <button
                      onClick={() => openRevealModal('cpf')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm"
                      title="Revelar CPF completo"
                    >
                      <FaEye size={12} />
                    </button>
                  )}
                  {revealedData.cpf && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                      <FaEyeSlash size={12} />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-sage-600">
                  <FaCreditCard size={10} className="text-primary-600" />
                  Método de Pagamento
                </label>
                <input 
                  value={order.payment_method || ''} 
                  disabled 
                  className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-900 text-sm focus:outline-none focus:border-primary-300 transition-colors" 
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white border border-primary-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center border border-primary-200">
                <FaEdit className="text-primary-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-sage-900">Status do Pedido</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-sage-600 mb-2">Status do Pedido</label>
                <select
                  value={order.status}
                  onChange={(e) => setOrder({ ...order, status: e.target.value as Order['status'] })}
                  className="w-full bg-white border border-primary-200 rounded-lg px-4 py-2.5 text-sage-900 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                >
                  <option value="pending">Pendente</option>
                  <option value="processing">Processando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-sage-600 mb-2">Status do Pagamento</label>
                <select
                  value={order.payment_status}
                  onChange={(e) => setOrder({ ...order, payment_status: e.target.value as Order['payment_status'] })}
                  className="w-full bg-white border border-primary-200 rounded-lg px-4 py-2.5 text-sage-900 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="failed">Falhou</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white border border-primary-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center border border-primary-200">
                  <FaMapMarkerAlt className="text-primary-600" size={18} />
                </div>
                <h3 className="text-lg font-bold text-sage-900">Endereço de Entrega</h3>
              </div>
              {!revealedData.address && (
                <button
                  onClick={() => openRevealModal('address')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-primary-500/25"
                >
                  <FaEye size={14} />
                  Revelar Endereço
                </button>
              )}
            </div>
            {revealedData.address && order.formatted_address ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-2">Rua</label>
                  <input value={order.formatted_address.street} disabled className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-2">Número</label>
                  <input value={order.formatted_address.number} disabled className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-2">Complemento</label>
                  <input value={order.formatted_address.complement || 'N/A'} disabled className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-2">Bairro</label>
                  <input value={order.formatted_address.neighborhood} disabled className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-2">Cidade</label>
                  <input value={order.formatted_address.city} disabled className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-2">Estado</label>
                  <input value={order.formatted_address.state} disabled className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-2">CEP</label>
                  <input value={order.formatted_address.zipcode} disabled className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-2">Custo do Frete</label>
                  <input value={`R$ ${order.formatted_address.shipping_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} disabled className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-700 text-sm" />
                </div>
              </div>
            ) : revealedData.address ? (
              <div>
                <label className="block text-xs font-medium text-sage-600 mb-2">Endereço Completo</label>
                <textarea
                  value={order.shipping_address || ''}
                  disabled
                  rows={3}
                  className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-700 text-sm"
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-sage-50 border border-primary-100 rounded-lg p-6">
                  <FaEyeSlash className="mx-auto text-sage-400 mb-3" size={24} />
                  <p className="text-sage-600 text-sm font-medium">Endereço protegido</p>
                  <p className="text-sage-500 text-xs mt-1">Clique em &quot;Revelar Endereço&quot; para visualizar</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white border border-primary-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center border border-primary-200">
                <FaTruck className="text-primary-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-sage-900">Rastreamento e Envio</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-sage-600 mb-2">Código de Rastreamento</label>
                <input
                  value={order.tracking_code || ''}
                  onChange={(e) => setOrder({ ...order, tracking_code: e.target.value })}
                  placeholder="Ex: AA123456789BR"
                  className="w-full bg-white border border-primary-200 rounded-lg px-4 py-2.5 text-sage-900 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-sage-600 mb-2">URL de Rastreamento</label>
                <input
                  value={order.tracking_url || ''}
                  onChange={(e) => setOrder({ ...order, tracking_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white border border-primary-200 rounded-lg px-4 py-2.5 text-sage-900 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-sage-600 mb-2">Transportadora</label>
                <input
                  value={order.shipping_company || ''}
                  onChange={(e) => setOrder({ ...order, shipping_company: e.target.value })}
                  placeholder="Ex: Correios, Jadlog, Loggi"
                  className="w-full bg-white border border-primary-200 rounded-lg px-4 py-2.5 text-sage-900 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-sage-600 mb-2">Status de Envio</label>
                <input
                  value={order.shipping_status || ''}
                  onChange={(e) => setOrder({ ...order, shipping_status: e.target.value })}
                  placeholder="Ex: Postado, Em trânsito, Aguardando retirada"
                  className="w-full bg-white border border-primary-200 rounded-lg px-4 py-2.5 text-sage-900 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-sage-600 mb-2">Observações de Envio</label>
                <textarea
                  value={order.shipping_notes || ''}
                  onChange={(e) => setOrder({ ...order, shipping_notes: e.target.value })}
                  rows={3}
                  placeholder="Observações sobre o envio, instruções especiais, etc."
                  className="w-full bg-white border border-primary-200 rounded-lg px-4 py-2.5 text-sage-900 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white border border-primary-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center border border-primary-200">
                <FaBox className="text-primary-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-sage-900">Itens do Pedido</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-primary-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-sage-600 uppercase tracking-wider">Produto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-sage-600 uppercase tracking-wider">Quantidade</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-sage-600 uppercase tracking-wider">Preço Unit.</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-sage-600 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-primary-50/50 transition-colors">
                      <td className="px-4 py-3 text-sage-900 text-sm">{item.product_name}</td>
                      <td className="px-4 py-3 text-sage-700 text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-sage-700 text-sm">R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right text-sage-900 font-medium text-sm">R$ {(item.unit_price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            variants={itemVariants}
            className="bg-white border border-primary-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center border border-primary-200">
                <FaDollarSign className="text-primary-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-sage-900">Detalhes Financeiros</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-primary-50">
                <span className="text-sm text-sage-600">Subtotal:</span>
                <span className="text-sm font-medium text-sage-900">R$ {order.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-primary-50">
                <span className="text-sm text-sage-600">Frete:</span>
                <span className="text-sm font-medium text-sage-900">R$ {order.shipping_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-primary-50">
                <span className="text-sm text-sage-600">Impostos:</span>
                <span className="text-sm font-medium text-sage-900">R$ {order.tax_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-primary-50">
                <span className="text-sm text-sage-600">Desconto:</span>
                <span className="text-sm font-medium text-sage-900">R$ {order.discount_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-primary-200">
                <span className="text-base font-bold text-sage-900">Total:</span>
                <span className="text-xl font-bold text-primary-600">R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white border border-primary-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center border border-primary-200">
                <FaCalendarAlt className="text-primary-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-sage-900">Datas Importantes</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-sage-600">Criado em:</span>
                <div className="text-sm font-medium text-sage-900 mt-1">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div>
                <span className="text-xs text-sage-600">Atualizado em:</span>
                <div className="text-sm font-medium text-sage-900 mt-1">
                  {new Date(order.updatedAt).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {order.shipped_at && (
                <div>
                  <span className="text-xs text-sage-600">Enviado em:</span>
                  <div className="text-sm font-medium text-sage-900 mt-1">
                    {new Date(order.shipped_at).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
              {order.delivered_at && (
                <div>
                  <span className="text-xs text-sage-600">Entregue em:</span>
                  <div className="text-sm font-medium text-sage-900 mt-1">
                    {new Date(order.delivered_at).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {order.notes && (
            <motion.div
              variants={itemVariants}
              className="bg-white border border-primary-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-sage-900 mb-3">Observações</h3>
              <textarea
                value={order.notes}
                disabled
                rows={4}
                className="w-full bg-sage-50 border border-primary-100 rounded-lg px-4 py-2.5 text-sage-700 text-sm"
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showRevealModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !revealing && setShowRevealModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-primary-100 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center border border-amber-200">
                  <FaLock className="text-amber-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-sage-900 mb-1">Revelação de Dados Sensíveis</h3>
                  <p className="text-sage-600 text-sm">
                    {dataToReveal === 'email' && 'Solicitação para revelar email do cliente'}
                    {dataToReveal === 'phone' && 'Solicitação para revelar telefone do cliente'}
                    {dataToReveal === 'cpf' && 'Solicitação para revelar CPF do cliente'}
                    {dataToReveal === 'address' && 'Solicitação para revelar endereço de entrega do cliente'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRevealModal(false)
                    setAdminPassword('')
                    setDataToReveal(null)
                  }}
                  className="w-8 h-8 bg-sage-100 hover:bg-sage-200 text-sage-600 hover:text-sage-900 rounded-lg flex items-center justify-center transition-all duration-300"
                  disabled={revealing}
                >
                  <FaTimes size={14} />
                </button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaExclamationTriangle className="text-amber-600" size={14} />
                  </div>
                  <div>
                    <h4 className="text-amber-800 font-semibold text-sm mb-1">Aviso de Segurança</h4>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      Esta ação será registrada nos logs de auditoria com timestamp e hash único. 
                      Apenas administradores autenticados podem revelar dados sensíveis.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-sage-700">
                  <FaShieldAlt size={12} className="text-primary-500" />
                  Senha de Administrador
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Digite sua senha de administrador..."
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-3 text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-400 transition-all duration-300 text-sm"
                    autoFocus
                    disabled={revealing}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaLock className="text-sage-400" size={14} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRevealModal(false)
                    setAdminPassword('')
                    setDataToReveal(null)
                  }}
                  className="flex-1 px-6 py-3 bg-sage-100 hover:bg-sage-200 border border-sage-200 hover:border-sage-300 text-sage-700 hover:text-sage-900 rounded-xl transition-all duration-300 font-medium text-sm"
                  disabled={revealing}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => dataToReveal && handleRevealData(dataToReveal)}
                  disabled={!adminPassword || revealing}
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-sage-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
                >
                  {revealing ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <FaEye size={14} />
                      Revelar Dados
                    </>
                  )}
                </button>
              </div>
              <div className="mt-6 pt-4 border-t border-primary-100">
                <div className="flex items-center gap-2 text-xs text-sage-500">
                  <FaShieldAlt size={10} />
                  <span>Esta ação é auditada e monitorada por segurança</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
