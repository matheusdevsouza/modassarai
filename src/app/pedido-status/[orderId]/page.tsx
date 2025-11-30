'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Spinner,
  House,
  Receipt,
  ArrowRight,
  CreditCard,
  Truck,
  WarningCircle,
  ArrowSquareOut
} from 'phosphor-react'
import { useAuth } from '@/contexts/AuthContext'

interface OrderStatus {
  id: number
  order_number: string
  status: string
  payment_status: string
  payment_method: string | null
  created_at: string
  updated_at: string
  external_reference: string | null
}

export default function PedidoStatusPage() {
  const params = useParams()
  const router = useRouter()
  const { authenticated, user } = useAuth()
  const orderToken = params?.orderId as string 

  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initPoint, setInitPoint] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const [shouldRedirectToCheckout, setShouldRedirectToCheckout] = useState(false)
  const [checkoutOpened, setCheckoutOpened] = useState(false)
  
  const hasRedirectedRef = useRef(false)
  const pageMountedRef = useRef(false)

  useEffect(() => {
    pageMountedRef.current = true
    return () => {
      pageMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !orderToken) return
    
    const searchParams = new URLSearchParams(window.location.search)
    const shouldRedirect = searchParams.get('redirect') === 'true'
    
    if (shouldRedirect) {
      const fetchInitPoint = async () => {
        try {
          const response = await fetch(`/api/orders/${orderToken}/init-point`)
          const data = await response.json()
          
          if (data.success && data.init_point) {
            setInitPoint(data.init_point)
            setShouldRedirectToCheckout(true)
            
            const newUrl = window.location.pathname
            if (window.location.search) {
              window.history.replaceState({}, '', newUrl)
            }
          }
        } catch (error) {
          console.error('Erro ao buscar init_point:', error)
        }
      }
      
      fetchInitPoint()
    }
  }, [orderToken])

  const fetchOrderStatus = useCallback(async () => {
    if (!orderToken) return

    try {
      const response = await fetch(`/api/orders/${orderToken}/status`)
      const data = await response.json()

      if (data.success && data.order) {
        setOrderStatus(data.order)
        setError(null)

        if (data.order.payment_status === 'pending' && !initPoint) {
          fetch(`/api/orders/${orderToken}/init-point`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.init_point) {
                setInitPoint(data.init_point)
              }
            })
            .catch(err => console.error('Erro ao buscar init_point:', err))
        }
      } else {
        setError(data.error || 'Erro ao carregar status do pedido')
      }
    } catch (err) {
      console.error('Erro ao buscar status:', err)
      setError('Erro ao carregar status do pedido')
    } finally {
      setLoading(false)
    }
  }, [orderToken, initPoint])

  useEffect(() => {
    if (!orderToken) {
      setError('Token do pedido não encontrado')
      setLoading(false)
      return
    }

    fetchOrderStatus()
  }, [orderToken, fetchOrderStatus])

  useEffect(() => {
    if (!orderStatus || orderStatus.payment_status !== 'pending') {
      return
    }

    const pollInterval = checkoutOpened ? 3000 : 5000
    
    const interval = setInterval(() => {
      fetchOrderStatus()
    }, pollInterval)

    return () => clearInterval(interval)
  }, [orderStatus?.payment_status, checkoutOpened, fetchOrderStatus])

  const openCheckoutInNewTab = useCallback(() => {
    if (!initPoint || !initPoint.startsWith('http')) {
      return false
    }
    
    try {
      const link = document.createElement('a')
      link.href = initPoint
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.style.display = 'none'
      document.body.appendChild(link)
      
      link.click()
      
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
      }, 100)
      
      return true
      
    } catch (error) {
      try {
        const checkoutWindow = window.open(initPoint, '_blank', 'noopener,noreferrer')
        
        if (!checkoutWindow || checkoutWindow.closed || typeof checkoutWindow.closed === 'undefined') {
          return false
        }
        
        return true
        
      } catch (error2) {
        return false
      }
    }
  }, [initPoint])

  useEffect(() => {
    if (!shouldRedirectToCheckout || !initPoint || hasRedirectedRef.current || loading) {
      return
    }
    
    const attemptRedirect = () => {
      if (!pageMountedRef.current) {
        return
      }

      if (typeof window === 'undefined' || typeof document === 'undefined') {
        setTimeout(attemptRedirect, 100)
        return
      }

      const isDocumentReady = document.readyState === 'complete'
      const hasContent = document.body && document.body.children.length > 0
      
      if (!isDocumentReady || !hasContent || loading) {
        setTimeout(attemptRedirect, 200)
        return
      }

      setTimeout(() => {
        if (!pageMountedRef.current || hasRedirectedRef.current) {
          return
        }
        
        hasRedirectedRef.current = true
        
        const opened = openCheckoutInNewTab()
        
        if (opened) {
          setRedirecting(true)
          setCheckoutOpened(true)
        } else {
          hasRedirectedRef.current = false 
        }
      }, 1500) 
    }
    
    attemptRedirect()
  }, [shouldRedirectToCheckout, initPoint, loading, openCheckoutInNewTab])

  const getStatusConfig = () => {
    if (!orderStatus) return null

    const statusMap: Record<string, { icon: React.ReactNode; color: string; bgColor: string; title: string; message: string }> = {
      pending: {
        icon: <Clock size={48} weight="fill" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        title: 'Aguardando Pagamento',
        message: checkoutOpened
          ? 'Checkout do Mercado Pago foi aberto em nova aba. Complete o pagamento na nova aba que abriu.' 
          : 'Seu pedido está aguardando confirmação do pagamento. Aguarde alguns instantes...'
      },
      paid: {
        icon: <CheckCircle size={48} weight="fill" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        title: 'Pagamento Aprovado!',
        message: 'Seu pagamento foi confirmado com sucesso. Seu pedido está sendo processado!'
      },
      failed: {
        icon: <XCircle size={48} weight="fill" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        title: 'Pagamento Recusado',
        message: 'Não foi possível processar o pagamento. Por favor, tente novamente.'
      },
      cancelled: {
        icon: <XCircle size={48} weight="fill" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        title: 'Pedido Cancelado',
        message: 'Este pedido foi cancelado.'
      }
    }

    const paymentStatus = orderStatus.payment_status || 'pending'
    return statusMap[paymentStatus] || statusMap.pending
  }

  const statusConfig = getStatusConfig()

  const handleGoToHome = () => {
    router.push('/')
  }

  const handleGoToOrders = () => {
    if (authenticated) {
      router.push('/meus-pedidos')
    } else {
      router.push('/')
    }
  }

  const handleOpenCheckout = () => {
    const opened = openCheckoutInNewTab()
    if (opened) {
      setRedirecting(true)
      setCheckoutOpened(true)
    }
  }

  const shouldShowMyOrdersButton = authenticated && orderStatus && 
    (orderStatus.payment_status === 'paid' || orderStatus.payment_status === 'failed')

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size={64} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-sage-700 text-lg">Carregando status do pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !orderStatus) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-cloud-200 rounded-2xl p-8 max-w-md mx-4 text-center shadow-sm"
        >
          <WarningCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-sage-900 mb-4">Erro</h1>
          <p className="text-sage-700 mb-6">{error || 'Pedido não encontrado'}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoToHome}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md"
          >
            Voltar ao Início
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50 pt-48 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-cloud-100 rounded-2xl p-8 max-w-2xl mx-auto shadow-sm"
        >
          <div className="text-center mb-6">
            {statusConfig && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`w-24 h-24 ${statusConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <div className={statusConfig.color}>
                  {statusConfig.icon}
                </div>
              </motion.div>
            )}
            <h1 className="text-3xl font-bold text-sage-900 mb-2">
              {statusConfig?.title || 'Status do Pedido'}
            </h1>
            <p className="text-sage-700 text-lg mb-4">
              {statusConfig?.message || 'Aguardando atualização...'}
            </p>
            <div className="bg-cloud-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-sage-600 mb-1">Número do Pedido</p>
              <p className="text-xl font-bold text-primary-600">{orderStatus.order_number}</p>
            </div>
          </div>

          <div className="bg-cloud-50 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-sage-900 mb-4">Informações do Pedido</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sage-700">Status:</span>
                <span className="font-semibold text-sage-900 capitalize">
                  {orderStatus.status === 'pending' ? 'Pendente' :
                   orderStatus.status === 'paid' ? 'Pago' :
                   orderStatus.status === 'processing' ? 'Processando' :
                   orderStatus.status === 'shipped' ? 'Enviado' :
                   orderStatus.status === 'delivered' ? 'Entregue' :
                   orderStatus.status === 'cancelled' ? 'Cancelado' : orderStatus.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sage-700">Pagamento:</span>
                <span className="font-semibold text-sage-900 capitalize">
                  {orderStatus.payment_status === 'pending' ? 'Pendente' :
                   orderStatus.payment_status === 'paid' ? 'Aprovado' :
                   orderStatus.payment_status === 'failed' ? 'Recusado' :
                   orderStatus.payment_status === 'refunded' ? 'Reembolsado' : orderStatus.payment_status}
                </span>
              </div>
              {orderStatus.payment_method && (
                <div className="flex justify-between">
                  <span className="text-sage-700">Forma de Pagamento:</span>
                  <span className="font-semibold text-sage-900">{orderStatus.payment_method}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sage-700">Data do Pedido:</span>
                <span className="font-semibold text-sage-900">
                  {new Date(orderStatus.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {initPoint && orderStatus?.payment_status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-yellow-800 font-semibold mb-1">Abrir checkout do Mercado Pago</p>
                  <p className="text-yellow-700 text-sm">Clique no botão abaixo para abrir o checkout em uma nova aba</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenCheckout}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  <CreditCard size={20} />
                  Abrir Checkout
                  <ArrowSquareOut size={20} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {orderStatus.payment_status === 'pending' && !initPoint && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <Spinner size={24} className="animate-spin text-yellow-600" />
                <p className="text-yellow-700 text-sm">
                  Aguardando confirmação do pagamento... Atualizando automaticamente.
                </p>
              </div>
            </div>
          )}
  
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {shouldShowMyOrdersButton ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoToOrders}
                  className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Receipt size={20} />
                  Ver Meus Pedidos
                  <ArrowRight size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoToHome}
                  className="bg-cloud-100 hover:bg-cloud-200 text-sage-800 font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <House size={20} />
                  Voltar ao Início
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoToHome}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <House size={20} />
                Voltar ao Início
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
