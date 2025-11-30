import { NextRequest, NextResponse } from 'next/server'
import database from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Número do pedido é obrigatório' },
        { status: 400 }
      )
    }

    const orders = await database.query(
      'SELECT id, access_token FROM orders WHERE order_number = ? LIMIT 1',
      [orderNumber]
    )

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    const order = orders[0]
    const orderToken = order.access_token || order.id.toString()

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderToken: orderToken, 
      orderNumber: orderNumber
    })
  } catch (error) {
    console.error('Erro ao buscar pedido por número:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

