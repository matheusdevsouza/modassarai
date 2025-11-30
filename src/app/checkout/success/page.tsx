'use client'
import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Spinner } from 'phosphor-react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderNumber = searchParams.get('order')

  useEffect(() => {
    if (!orderNumber) {
      router.push('/')
      return
    }

    const fetchOrderToken = async () => {
      try {
        const response = await fetch(`/api/orders/by-number?orderNumber=${orderNumber}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.orderToken) {
            router.push(`/pedido-status/${data.orderToken}`)
          } else {
            router.push('/')
          }
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Erro ao buscar pedido:', error)
        router.push('/')
      }
    }
    
    fetchOrderToken()

  }, [orderNumber, router])

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size={64} className="animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-sage-700 text-lg">Redirecionando...</p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size={64} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-sage-700 text-lg">Carregando...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
