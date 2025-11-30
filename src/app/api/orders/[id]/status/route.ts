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
          order_number,
          status,
          payment_status,
          payment_method,
          created_at,
          updated_at,
          external_reference
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
          order_number,
          status,
          payment_status,
          payment_method,
          created_at,
          updated_at,
          external_reference
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

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        created_at: order.created_at,
        updated_at: order.updated_at,
        external_reference: order.external_reference
      }
    })
  } catch (error) {
    console.error('Erro ao buscar status do pedido:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

