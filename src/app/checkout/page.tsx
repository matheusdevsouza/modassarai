'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  CreditCard, 
  MapPin, 
  User, 
  Phone, 
  Envelope,
  Trash,
  Plus,
  Minus,
  ArrowLeft,
  Shield,
  Truck,
  Clock,
  CheckCircle,
  Warning,
  Lock,
  CreditCard as CreditCardIcon,
  QrCode,
  Bank,
  ShoppingCart,
  X,
  Info
} from 'phosphor-react'
import React from 'react'
interface CustomerData {
  name: string
  email: string
  emailConfirm: string
  phone: string
  cpf: string
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}
interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  installments?: number[]
}
export default function CheckoutPage() {
  const { state: cartState, removeItem, updateQuantity, clearCart } = useCart()
  const { user, authenticated } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [guestChecklist, setGuestChecklist] = useState({
    acceptTerms: false,
    acceptTracking: false,
    acceptPrivacy: false
  })
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: user?.display_name || user?.name || '',
    email: user?.email || '',
    emailConfirm: user?.email || '',
    phone: '',
    cpf: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  })
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      icon: <CreditCardIcon size={24} />,
      description: 'Pague em até 12x sem juros',
      installments: [1, 2, 3, 6, 12]
    },
    {
      id: 'pix',
      name: 'PIX',
      icon: <QrCode size={24} />,
      description: 'Pagamento instantâneo',
      installments: [1]
    },
    {
      id: 'bank_slip',
      name: 'Boleto Bancário',
      icon: <Bank size={24} />,
      description: 'Vencimento em 3 dias úteis',
      installments: [1]
    }
  ]
  const total = cartState.total
  useEffect(() => {
    if (user?.email && customerData.email === user.email) {
      setCustomerData(prev => ({ ...prev, emailConfirm: user.email }))
    }
  }, [user?.email, customerData.email])
  const handleNextStep = () => {
    if (currentStep === 1) {
      const requiredFields = {
        name: 'Nome',
        email: 'E-mail',
        emailConfirm: 'Confirmação de E-mail',
        phone: 'Telefone',
        cpf: 'CPF',
        zipCode: 'CEP',
        street: 'Rua',
        number: 'Número',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado'
      }
      const missingFields = []
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!customerData[field as keyof CustomerData] || customerData[field as keyof CustomerData].trim() === '') {
          missingFields.push(label)
        }
      }
      const validationErrors = []
      if (missingFields.length > 0) {
        validationErrors.push(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (customerData.email && !emailRegex.test(customerData.email)) {
        validationErrors.push('E-mail inválido')
      }
      if (customerData.email !== customerData.emailConfirm) {
        validationErrors.push('Os e-mails não coincidem')
      }
      if (!customerData.email || !customerData.emailConfirm) {
        validationErrors.push('E-mail e confirmação são obrigatórios')
      }
      if (customerData.email !== customerData.emailConfirm) {
        validationErrors.push('Os e-mails não coincidem')
      }
      const cpfClean = customerData.cpf.replace(/\D/g, '')
      if (customerData.cpf && cpfClean.length !== 11) {
        validationErrors.push('CPF deve ter 11 dígitos')
      }
      const phoneClean = customerData.phone.replace(/\D/g, '')
      if (customerData.phone && phoneClean.length < 10) {
        validationErrors.push('Telefone deve ter pelo menos 10 dígitos')
      }
      const cepClean = customerData.zipCode.replace(/\D/g, '')
      if (customerData.zipCode && cepClean.length !== 8) {
        validationErrors.push('CEP deve ter 8 dígitos')
      }
      if (validationErrors.length > 0) {
        showErrorMessages(validationErrors)
        return
      }
    }
    if (currentStep === 2 && !selectedPaymentMethod) {
      showErrorMessages(['Por favor, selecione uma forma de pagamento'])
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }
  const handleFinishOrder = async () => {
    if (!authenticated) {
      const allAccepted = Object.values(guestChecklist).every(accepted => accepted)
      if (!allAccepted) {
        showErrorMessages(['Por favor, aceite todos os termos para continuar'])
        return
      }
    }
    setIsLoading(true)
    try {
      const checkoutData = {
        items: cartState.items.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          sku: (item.product as any).sku || null, 
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null
        })),
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone
        },
        shipping_address: {
          street: customerData.street,
          number: customerData.number,
          complement: customerData.complement,
          neighborhood: customerData.neighborhood,
          city: customerData.city,
          state: customerData.state,
          zipcode: customerData.zipCode,
          shipping_cost: 0 
        },
        payment_method: selectedPaymentMethod
      }
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar pedido')
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar pedido')
      }
      const initPoint = process.env.NODE_ENV === 'production' 
        ? result.init_point 
        : result.sandbox_init_point
      if (initPoint) {
        clearCart()
        window.open(initPoint, '_blank', 'noopener,noreferrer')
        router.push('/meus-pedidos')
      } else {
        clearCart()
        showErrorMessages(['Pedido criado com sucesso! O Mercado Pago não está configurado.'])
        setTimeout(() => {
          router.push('/meus-pedidos')
        }, 3000)
      }
    } catch (error) {
      showErrorMessages([`Erro ao finalizar pedido: ${(error as Error).message}`])
    } finally {
      setIsLoading(false)
    }
  }
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }
  const getRequiredFieldsCount = () => {
    const requiredFields = [
      customerData.name,
      customerData.email,
      customerData.emailConfirm,
      customerData.phone,
      customerData.cpf,
      customerData.zipCode,
      customerData.street,
      customerData.number,
      customerData.neighborhood,
      customerData.city,
      customerData.state
    ]
    const filledFields = requiredFields.filter(field => field && field.trim() !== '').length
    return { filled: filledFields, total: requiredFields.length }
  }
  const showErrorMessages = (errorList: string[]) => {
    setErrors(errorList)
    setShowErrors(true)
    setTimeout(() => {
      setShowErrors(false)
    }, 5000) 
  }
  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-primary-50 border border-cloud-100 rounded-2xl p-8 max-w-md mx-4 shadow-sm">
            <div className="flex justify-center mb-4">
              <ShoppingCart size={64} className="text-sage-600" />
            </div>
            <h2 className="text-2xl font-bold text-sage-900 mb-4">Carrinho Vazio</h2>
            <p className="text-sage-800 mb-6">Adicione produtos ao seu carrinho para continuar com a compra.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/produtos')}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Ver Produtos
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-sand-100">
      <div className="container mx-auto px-4 py-4 pt-12">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sage-700 hover:text-sage-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar
          </motion.button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary-600" />
              <span className="text-sage-900 font-medium">{cartState.itemCount} item{cartState.itemCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="text-sage-900 font-bold">
              R$ {total.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
        {!authenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 text-blue-700 text-sm">
              <Info size={16} className="text-blue-600" />
              <span>
                <strong>Usuário sem conta:</strong> Você receberá o código de rastreio por e-mail quando o pedido for despachado
              </span>
            </div>
          </motion.div>
        )}
      </div>
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary-50 border border-cloud-100 rounded-2xl p-6 shadow-sm"
            >
              <AnimatePresence>
                {showErrors && errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                  >
                    <div className="flex items-start gap-3">
                      <Warning size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-red-700 font-semibold mb-2">Erro na validação</h4>
                        <ul className="space-y-1">
                          {errors.map((error, index) => (
                            <li key={index} className="text-red-700 text-sm">
                              • {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => setShowErrors(false)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      currentStep >= step 
                        ? 'bg-primary-500 text-white shadow-md' 
                        : 'bg-cloud-200 text-sage-600'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-64 h-1 mx-2 ${
                        currentStep > step ? 'bg-primary-500' : 'bg-cloud-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <User size={24} className="text-primary-600" />
                    <h2 className="text-2xl font-bold text-sage-900">Dados Pessoais</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sage-900 mb-2 font-medium">Nome <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                          customerData.name.trim() === '' ? 'border-red-500' : 'border-cloud-200'
                        }`}
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sage-900 mb-2 font-medium">E-mail <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                          customerData.email.trim() === '' ? 'border-red-500' : 'border-cloud-200'
                        }`}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sage-900 mb-2 font-medium">Confirmar E-mail <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={customerData.emailConfirm}
                        onChange={(e) => setCustomerData({...customerData, emailConfirm: e.target.value})}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                          customerData.emailConfirm.trim() === '' ? 'border-red-500' : 
                          customerData.email !== customerData.emailConfirm ? 'border-red-500' : 'border-cloud-200'
                        }`}
                        placeholder="Confirme seu e-mail"
                        required
                      />
                      {customerData.emailConfirm.trim() !== '' && customerData.email !== customerData.emailConfirm && (
                        <p className="text-red-600 text-sm mt-1">Os e-mails não coincidem</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sage-900 mb-2 font-medium">Telefone <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                          customerData.phone.trim() === '' ? 'border-red-500' : 'border-cloud-200'
                        }`}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sage-900 mb-2 font-medium">CPF <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={customerData.cpf}
                        onChange={(e) => setCustomerData({...customerData, cpf: e.target.value})}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                          customerData.cpf.trim() === '' ? 'border-red-500' : 'border-cloud-200'
                        }`}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-cloud-200">
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin size={24} className="text-primary-600" />
                      <h3 className="text-xl font-bold text-sage-900">Endereço de Entrega</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sage-900 mb-2 font-medium">CEP <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={customerData.zipCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                            setCustomerData({...customerData, zipCode: value})
                          }}
                          className={`w-full px-4 py-3 bg-white border rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                            customerData.zipCode.trim() === '' ? 'border-red-500' : 'border-cloud-200'
                          }`}
                          placeholder="06790100"
                          maxLength={8}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sage-900 mb-2 font-medium">Rua <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={customerData.street}
                          onChange={(e) => setCustomerData({...customerData, street: e.target.value})}
                          className={`w-full px-4 py-3 bg-white border rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                            customerData.street.trim() === '' ? 'border-red-500' : 'border-cloud-200'
                          }`}
                          placeholder="Nome da rua"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sage-900 mb-2 font-medium">Número <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={customerData.number}
                          onChange={(e) => setCustomerData({...customerData, number: e.target.value})}
                          className={`w-full px-4 py-3 bg-white border rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                            customerData.number.trim() === '' ? 'border-red-500' : 'border-cloud-200'
                          }`}
                          placeholder="123"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sage-900 mb-2 font-medium">Complemento</label>
                        <input
                          type="text"
                          value={customerData.complement}
                          onChange={(e) => setCustomerData({...customerData, complement: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-cloud-200 rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                          placeholder="Apto, bloco, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sage-900 mb-2 font-medium">Bairro <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={customerData.neighborhood}
                          onChange={(e) => setCustomerData({...customerData, neighborhood: e.target.value})}
                          className={`w-full px-4 py-3 bg-white border rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                            customerData.neighborhood.trim() === '' ? 'border-red-500' : 'border-cloud-200'
                          }`}
                          placeholder="Nome do bairro"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sage-900 mb-2 font-medium">Cidade <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={customerData.city}
                          onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                          className={`w-full px-4 py-3 bg-white border rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                            customerData.city.trim() === '' ? 'border-red-500' : 'border-cloud-200'
                          }`}
                          placeholder="Nome da cidade"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sage-900 mb-2 font-medium">Estado <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={customerData.state}
                          onChange={(e) => setCustomerData({...customerData, state: e.target.value})}
                          className={`w-full px-4 py-3 bg-white border rounded-lg text-sage-900 placeholder-sage-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${
                            customerData.state.trim() === '' ? 'border-red-500' : 'border-cloud-200'
                          }`}
                          placeholder="UF"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-6">
                    <div className="text-sm text-sage-700">
                      {getRequiredFieldsCount().filled} de {getRequiredFieldsCount().total} campos obrigatórios preenchidos
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextStep}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      Continuar
                    </motion.button>
                  </div>
                </motion.div>
              )}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard size={24} className="text-primary-600" />
                    <h2 className="text-2xl font-bold text-sage-900">Forma de Pagamento</h2>
                  </div>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id
                            ? 'border-primary-500 bg-primary-50 shadow-sm'
                            : 'border-cloud-200 hover:border-primary-300 bg-white'
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-primary-600">
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sage-900">{method.name}</h3>
                            <p className="text-sm text-sage-700">{method.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            selectedPaymentMethod === method.id
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-cloud-300'
                          }`}>
                            {selectedPaymentMethod === method.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevStep}
                      className="bg-cloud-100 hover:bg-cloud-200 text-sage-800 font-semibold px-8 py-3 rounded-xl transition-colors"
                    >
                      Voltar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextStep}
                      disabled={!selectedPaymentMethod}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      Continuar
                    </motion.button>
                  </div>
                </motion.div>
              )}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle size={24} className="text-primary-600" />
                    <h2 className="text-2xl font-bold text-sage-900">Confirmação do Pedido</h2>
                  </div>
                  <div className="bg-white border border-cloud-100 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-sage-900 mb-3">Resumo do Pedido</h3>
                    <div className="space-y-2 text-sm text-sage-800">
                       <div className="flex justify-between">
                         <span>Itens:</span>
                         <span>{cartState.itemCount} produto{cartState.itemCount !== 1 ? 's' : ''}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Subtotal:</span>
                        <span>R$ {cartState.total.toFixed(2).replace('.', ',')}</span>
                       </div>
                      <div className="border-t border-cloud-200 pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-sage-900">
                           <span>Total Final:</span>
                          <span className="text-lg text-primary-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                         </div>
                       </div>
                     </div>
                   </div>
                   {!authenticated && (
                     <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="bg-white border border-cloud-100 rounded-lg p-6 shadow-sm"
                     >
                       <div className="flex items-center gap-3 mb-4">
                         <Warning size={24} className="text-yellow-600" />
                         <h3 className="text-lg font-semibold text-sage-900">Importante para Usuários sem Conta</h3>
                       </div>
                       <div className="space-y-4 mb-6">
                         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                           <p className="text-yellow-800 text-sm leading-relaxed">
                             <strong>⚠️ Atenção:</strong> Como você não está logado em uma conta, algumas funcionalidades estarão limitadas:
                           </p>
                           <ul className="mt-2 space-y-1 text-yellow-700 text-sm">
                             <li>• Não será possível acompanhar o pedido na seção &quot;Meus Pedidos&quot;</li>
                             <li>• O histórico de compras não ficará salvo no site</li>
                             <li>• Não será possível alterar dados do pedido após a compra</li>
                           </ul>
                         </div>
                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                           <p className="text-blue-800 text-sm leading-relaxed">
                             <strong>📧 Boa notícia:</strong> Quando seu pedido for despachado, você receberá um e-mail com:
                           </p>
                           <ul className="mt-2 space-y-1 text-blue-700 text-sm">
                             <li>• Código de rastreio completo</li>
                             <li>• Link direto para o 17Track</li>
                             <li>• Instruções para rastreio manual no site</li>
                             <li>• Todas as informações do pedido</li>
                           </ul>
                         </div>
                       </div>
                       <div className="space-y-3">
                         <label className="flex items-start gap-3 cursor-pointer">
                           <input
                             type="checkbox"
                             checked={guestChecklist.acceptTerms}
                             onChange={(e) => setGuestChecklist(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                             className="mt-1 w-4 h-4 text-primary-500 bg-white border-cloud-300 rounded focus:ring-primary-500 focus:ring-2"
                           />
                           <span className="text-sm text-sage-800">
                             <span className="text-primary-600 font-medium">Aceito os termos de compra</span> e entendo que não estarei logado em uma conta
                           </span>
                         </label>
                         <label className="flex items-start gap-3 cursor-pointer">
                           <input
                             type="checkbox"
                             checked={guestChecklist.acceptTracking}
                             onChange={(e) => setGuestChecklist(prev => ({ ...prev, acceptTracking: e.target.checked }))}
                             className="mt-1 w-4 h-4 text-primary-500 bg-white border-cloud-300 rounded focus:ring-primary-500 focus:ring-2"
                           />
                           <span className="text-sm text-sage-800">
                             <span className="text-primary-600 font-medium">Aceito receber o código de rastreio por e-mail</span> quando o pedido for despachado
                           </span>
                         </label>
                         <label className="flex items-start gap-3 cursor-pointer">
                           <input
                             type="checkbox"
                             checked={guestChecklist.acceptPrivacy}
                             onChange={(e) => setGuestChecklist(prev => ({ ...prev, acceptPrivacy: e.target.checked }))}
                             className="mt-1 w-4 h-4 text-primary-500 bg-white border-cloud-300 rounded focus:ring-2 focus:ring-primary-500"
                           />
                           <span className="text-sm text-sage-800">
                             <span className="text-primary-600 font-medium">Aceito a política de privacidade</span> e autorizo o uso dos meus dados para processamento do pedido
                           </span>
                         </label>
                       </div>
                       {Object.values(guestChecklist).every(accepted => accepted) && (
                         <motion.div
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3"
                         >
                           <div className="flex items-center gap-2 text-green-700 text-sm">
                             <CheckCircle size={16} className="text-green-600" />
                             <span>
                               <strong>Perfeito!</strong> Todos os termos foram aceitos. Você pode prosseguir com a compra.
                             </span>
                           </div>
                         </motion.div>
                       )}
                     </motion.div>
                   )}
                  <div className="flex justify-between pt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevStep}
                      className="bg-cloud-100 hover:bg-cloud-200 text-sage-800 font-semibold px-8 py-3 rounded-xl transition-colors"
                    >
                      Voltar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFinishOrder}
                      disabled={isLoading || (!authenticated && !Object.values(guestChecklist).every(accepted => accepted))}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {isLoading ? 'Processando...' : 'Finalizar Pedido'}
                    </motion.button>
                    {!authenticated && !Object.values(guestChecklist).every(accepted => accepted) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mt-3"
                      >
                        <p className="text-sm text-sage-700">
                          Para finalizar o pedido, aceite todos os termos acima
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary-50 border border-cloud-100 rounded-2xl p-6 sticky top-4 shadow-sm"
            >
              <h3 className="text-lg font-bold text-sage-900 mb-4">Resumo do Pedido</h3>
              <div className="space-y-3 mb-4">
                {cartState.items.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-cloud-100">
                      <Image
                        src={item.image || '/images/logo.png'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sage-900 truncate">{item.product.name}</h3>
                      {(item.size || item.color) && (
                        <div className="text-sm text-sage-700 flex items-center gap-2 flex-wrap">
                          {item.size && <span>Tamanho: {item.size}</span>}
                          {item.color && (
                            <span className="flex items-center gap-1">
                              {item.size && <span className="text-sage-500">•</span>}
                              Cor: {item.color}
                            </span>
                          )}
                          {!item.size && !item.color && <span>Tamanho: Único</span>}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-6 h-6 bg-cloud-200 rounded-full flex items-center justify-center hover:bg-cloud-300 transition-colors text-sage-800"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sage-900 font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-6 h-6 bg-cloud-200 rounded-full flex items-center justify-center hover:bg-cloud-300 transition-colors text-sage-800"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sage-900">R$ {(Number(item.price) * item.quantity).toFixed(2).replace('.', ',')}</p>
                      <p className="text-sm text-sage-700">R$ {Number(item.price).toFixed(2).replace('.', ',')} cada</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-cloud-200 pt-4">
                <div className="flex justify-between text-sage-800">
                  <span>Subtotal ({cartState.itemCount} itens)</span>
                  <span>R$ {cartState.total.toFixed(2).replace('.', ',')}</span>
                </div>
                 <div className="flex justify-between text-lg font-bold text-sage-900 border-t border-cloud-200 pt-3">
                   <span>Total Final</span>
                   <span className="text-primary-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                 </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-sage-800">
                  <Shield size={16} className="text-primary-600" />
                  <span>Compra 100% segura</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-sage-800">
                  <Truck size={16} className="text-primary-600" />
                  <span>Entrega em todo Brasil</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-sage-800">
                  <CheckCircle size={16} className="text-primary-600" />
                  <span>Garantia de 30 dias</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}