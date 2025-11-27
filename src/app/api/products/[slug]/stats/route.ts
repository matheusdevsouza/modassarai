import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug, getProductById, getProductStats, recordProductStat } from '@/lib/database'
import { getUserIdentifier, getRequestInfo } from '@/lib/user-identifier'
import { authenticateUser } from '@/lib/auth'

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug ou ID não informado' },
        { status: 400 }
      )
    }

    let product = null
    const productId = parseInt(slug)
    if (!isNaN(productId)) {
      product = await getProductById(productId)
    } else {
      product = await getProductBySlug(slug)
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const stats = await getProductStats(product.id)

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas do produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug ou ID não informado' },
        { status: 400 }
      )
    }

    let product = null
    const productId = parseInt(slug)
    if (!isNaN(productId)) {
      product = await getProductById(productId)
    } else {
      product = await getProductBySlug(slug)
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { actionType } = body

    if (!actionType || !['favorite', 'cart_add'].includes(actionType)) {
      return NextResponse.json(
        { error: 'Tipo de ação inválido' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(request)
    const userId = user?.userId

    const userIdentifier = getUserIdentifier(request, userId)
    const { ip, userAgent } = getRequestInfo(request)

    await recordProductStat(
      product.id,
      actionType,
      userIdentifier,
      userId,
      ip,
      userAgent
    )

    const stats = await getProductStats(product.id)

    return NextResponse.json({
      success: true,
      message: 'Ação registrada com sucesso',
      data: stats
    })
  } catch (error) {
    console.error('Erro ao registrar estatística:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

