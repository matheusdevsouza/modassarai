import { NextRequest, NextResponse } from 'next/server'
import { CartItem, MelhorEnvioProduct, MelhorEnvioQuote } from '@/types'
export const dynamic = 'force-dynamic'
const DEFAULT_WEIGHT = 0.3
const DEFAULT_LENGTH = 20
const DEFAULT_WIDTH = 15
const DEFAULT_HEIGHT = 5
const ORIGIN_POSTAL_CODE = process.env.SHIPPING_ORIGIN_POSTAL_CODE

interface ShippingRequest {
  postalCode: string
  products: Array<{
    id: string
    weight?: number
    length?: number
    width?: number
    height?: number
    price: number
    quantity: number
  }>
}

function formatProductForMelhorEnvio(product: ShippingRequest['products'][0]): MelhorEnvioProduct {
  return {
    id: product.id,
    width: (product.width || DEFAULT_WIDTH) / 10,
    height: (product.height || DEFAULT_HEIGHT) / 10,
    length: (product.length || DEFAULT_LENGTH) / 10,
    weight: product.weight || DEFAULT_WEIGHT,
    insurance_value: product.price * product.quantity,
    quantity: product.quantity
  }
}

async function calculateShippingFromMelhorEnvio(
  postalCode: string,
  products: MelhorEnvioProduct[]
): Promise<MelhorEnvioQuote[]> {
  let token = process.env.MELHOR_ENVIO_TOKEN

  if (!token) {
    throw new Error('MELHOR_ENVIO_TOKEN não configurado nas variáveis de ambiente')
  }

  token = token.trim()
  if (token.startsWith('Bearer ')) {
    token = token.substring(7).trim()
  }

  const isProduction = process.env.MELHOR_ENVIO_ENVIRONMENT === 'production'
  const baseUrl = isProduction
    ? 'https://www.melhorenvio.com.br'
    : 'https://sandbox.melhorenvio.com.br'

  try {
    const requestBody = {
      from: {
        postal_code: ORIGIN_POSTAL_CODE
      },
      to: {
        postal_code: postalCode.replace(/\D/g, '').slice(0, 8)
      },
      products: products.map(p => ({
        id: String(p.id),
        width: Number(p.width),
        height: Number(p.height),
        length: Number(p.length),
        weight: Number(p.weight),
        insurance_value: Number(p.insurance_value),
        quantity: Number(p.quantity)
      }))
    }

    const response = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Modas Saraí (mariapistache@email.com)'
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()
    let errorMessage = `Erro ao calcular frete: ${response.status} ${response.statusText}`

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorData.errors?.join(', ') || errorMessage

        console.error('❌ Erro na API Melhor Envio:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: `${baseUrl}/api/v2/me/shipment/calculate`,
          tokenLength: token.length,
          tokenPrefix: token.substring(0, 10) + '...'
        })
      } catch {
        errorMessage = responseText || errorMessage
        console.error('❌ Erro na API Melhor Envio (não-JSON):', {
          status: response.status,
          statusText: response.statusText,
          responseText: responseText.substring(0, 500)
        })
      }

      if (response.status === 401 || errorMessage.includes('unauthorized')) {
        throw new Error(`Token inválido ou expirado. Verifique se o MELHOR_ENVIO_TOKEN está correto e se não expirou. Status: ${response.status}`)
      }

      if (response.status === 403) {
        throw new Error(`Acesso negado (403). O token não tem permissões suficientes. Gere um novo token em "Integrações > Permissões de Acesso" e selecione TODAS as permissões, especialmente "Calcular frete" e "Cotação de envios".`)
      }

      throw new Error(errorMessage)
    }

    const data = JSON.parse(responseText)

    const quotes = Array.isArray(data) ? data : (data.data || data.quotes || [])

    if (!Array.isArray(quotes) || quotes.length === 0) {
      return []
    }

    return quotes.map((quote: any) => ({
      id: quote.id || quote.service_id || quote.name,
      name: quote.name || quote.service_name || quote.company?.name || 'Frete',
      price: typeof quote.price === 'string' ? quote.price : (quote.price?.toString() || quote.cost?.toString() || '0'),
      currency: quote.currency || 'BRL',
      delivery_time: quote.delivery_time || quote.delivery_range?.max || quote.deadline || 0,
      delivery_range: quote.delivery_range || {
        min: quote.delivery_range?.min || quote.delivery_time || 0,
        max: quote.delivery_range?.max || quote.delivery_time || 0
      },
      company: {
        id: quote.company?.id || quote.id || 0,
        name: quote.company?.name || quote.name || 'Transportadora',
        picture: quote.company?.picture || quote.picture || ''
      }
    })).filter((quote: any) => quote.price && parseFloat(quote.price) > 0)
  } catch (error: any) {
    console.error('❌ Erro ao calcular frete:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MELHOR_ENVIO_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'MELHOR_ENVIO_TOKEN não está configurado. Configure a variável de ambiente.',
          data: []
        },
        { status: 500 }
      )
    }

    const body: ShippingRequest = await request.json()

    if (!body.postalCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'CEP é obrigatório',
          data: []
        },
        { status: 400 }
      )
    }

    const cleanedPostalCode = body.postalCode.replace(/\D/g, '').slice(0, 8)

    if (cleanedPostalCode.length !== 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'CEP inválido. Deve conter 8 dígitos',
          data: []
        },
        { status: 400 }
      )
    }

    try {
      const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cleanedPostalCode}/json/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (viaCepResponse.ok) {
        const viaCepData = await viaCepResponse.json()

        if (viaCepData.erro) {
          return NextResponse.json(
            {
              success: false,
              error: 'CEP não encontrado. Por favor, verifique o CEP informado.',
              data: []
            },
            { status: 400 }
          )
        }

        const invalidPatterns = [
          '00000000', '11111111', '22222222', '33333333', '44444444',
          '55555555', '66666666', '77777777', '88888888', '99999999'
        ]

        if (invalidPatterns.includes(cleanedPostalCode)) {
          return NextResponse.json(
            {
              success: false,
              error: 'CEP inválido. Por favor, informe um CEP válido.',
              data: []
            },
            { status: 400 }
          )
        }

        if (!viaCepData.logradouro && !viaCepData.localidade) {
          return NextResponse.json(
            {
              success: false,
              error: 'CEP não encontrado. Por favor, verifique o CEP informado.',
              data: []
            },
            { status: 400 }
          )
        }
      }
    } catch (viaCepError) {
    }

    if (!body.products || !Array.isArray(body.products) || body.products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produtos são obrigatórios',
          data: []
        },
        { status: 400 }
      )
    }

    if (!ORIGIN_POSTAL_CODE || ORIGIN_POSTAL_CODE.length !== 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'CEP de origem não configurado. Configure SHIPPING_ORIGIN_POSTAL_CODE nas variáveis de ambiente.',
          data: []
        },
        { status: 500 }
      )
    }

    const melhorEnvioProducts = body.products.map(formatProductForMelhorEnvio)

    const quotes = await calculateShippingFromMelhorEnvio(cleanedPostalCode, melhorEnvioProducts)

    const shippingOptions = quotes
      .map((quote): any => ({
        id: quote.id.toString(),
        name: quote.name,
        price: parseFloat(quote.price) || 0,
        estimatedDays: quote.delivery_range?.max || quote.delivery_time || 0,
        company: quote.company.name,
        companyId: quote.company.id,
        deliveryRange: quote.delivery_range
      }))
      .filter((option: any) => option.price > 0)
      .sort((a: any, b: any) => a.price - b.price)

    if (shippingOptions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma opção de frete disponível para este CEP',
        data: []
      })
    }

    return NextResponse.json({
      success: true,
      data: shippingOptions
    })
  } catch (error: any) {
    console.error('❌ Erro ao calcular frete:', error)

    let errorMessage = error.message || 'Erro ao calcular frete. Tente novamente.'

    if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      errorMessage = 'Token de autenticação inválido ou expirado. Verifique se o MELHOR_ENVIO_TOKEN está correto.'
    } else if (errorMessage.includes('403') || errorMessage.includes('Acesso negado')) {
      errorMessage = 'Acesso negado (403). O token não tem as permissões necessárias. Gere um novo token em "Integrações > Permissões de Acesso" no painel do Melhor Envio e selecione TODAS as permissões, especialmente "Calcular frete" e "Cotação de envios". Consulte o arquivo SOLUCAO_ERRO_403.md para instruções detalhadas.'
    } else if (errorMessage.includes('404')) {
      errorMessage = 'Endpoint não encontrado. Verifique se o ambiente (sandbox/production) está correto.'
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        data: []
      },
      { status: 500 }
    )
  }
}

