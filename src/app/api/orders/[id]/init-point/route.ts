import { NextRequest, NextResponse } from 'next/server'
import database from '@/lib/database'
export const dynamic = 'force-dynamic'
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokenOrId = params.id
    
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tokenOrId)
    
    let orders
    
    if (isUUID) {
      orders = await database.query(`
        SELECT 
          id,
          init_point_url,
          payment_status,
          status
        FROM orders 
        WHERE access_token = ?
      `, [tokenOrId])
    } else {
      const id = parseInt(tokenOrId)
      if (isNaN(id)) {
        return NextResponse.json(
          { success: false, error: 'Token ou ID inválido' },
          { status: 400 }
        )
      }
      
      orders = await database.query(`
        SELECT 
          id,
          init_point_url,
          payment_status,
          status
        FROM orders 
        WHERE id = ?
      `, [id])
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    const order = orders[0]

    if (order.payment_status !== 'pending' && order.status !== 'pending') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Checkout não disponível - pedido já processado',
          available: false
        },
        { status: 403 }
      )
    }

    if (!order.init_point_url) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'URL de checkout não disponível',
          available: false
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      init_point: order.init_point_url,
      available: true
    })
  } catch (error) {
    console.error('Erro ao buscar init_point do pedido:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

