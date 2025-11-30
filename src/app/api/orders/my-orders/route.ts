import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import database from '@/lib/database';
import { decryptFromDatabase } from '@/lib/transparent-encryption';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const userId = user.userId;
    const orders = await database.query(`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.payment_method,
        o.subtotal,
        o.shipping_cost,
        o.tax_amount,
        o.discount_amount,
        o.total_amount,
        o.currency,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.shipping_address,
        o.notes,
        o.tracking_code,
        o.tracking_url,
        o.shipping_company,
        o.shipping_status,
        o.shipping_notes,
        o.shipped_at,
        o.delivered_at,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC
    `, [userId]);
    
    const processedOrders = orders.map((order: any) => {
      const decryptedOrder = decryptFromDatabase('orders', order);
      
      return {
        id: decryptedOrder.id,
        order_number: decryptedOrder.order_number,
        status: decryptedOrder.status,
        payment_status: decryptedOrder.payment_status,
        payment_method: decryptedOrder.payment_method,
        subtotal: parseFloat(decryptedOrder.subtotal),
        shipping_cost: parseFloat(decryptedOrder.shipping_cost),
        tax_amount: parseFloat(decryptedOrder.tax_amount),
        discount_amount: parseFloat(decryptedOrder.discount_amount),
        total_amount: parseFloat(decryptedOrder.total_amount),
        currency: decryptedOrder.currency,
        customer_name: decryptedOrder.customer_name,
        customer_email: decryptedOrder.customer_email,
        customer_phone: decryptedOrder.customer_phone,
        shipping_address: decryptedOrder.shipping_address,
        notes: decryptedOrder.notes,
        tracking_code: decryptedOrder.tracking_code,
        tracking_url: decryptedOrder.tracking_url,
        shipping_company: decryptedOrder.shipping_company,
        shipping_status: decryptedOrder.shipping_status,
        shipping_notes: decryptedOrder.shipping_notes,
        shipped_at: decryptedOrder.shipped_at,
        delivered_at: decryptedOrder.delivered_at,
        created_at: decryptedOrder.created_at,
        updated_at: decryptedOrder.updated_at,
        items: []
      };
    });
    
    for (const order of processedOrders) {
      const items = await database.query(`
        SELECT 
          oi.id,
          oi.product_id,
          oi.product_name,
          p.slug AS slug,
          COALESCE(pi.image_url, '') AS product_image,
          oi.size,
          oi.color,
          oi.quantity,
          oi.unit_price,
          oi.total_price
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        LEFT JOIN product_images pi ON pi.product_id = oi.product_id AND pi.is_primary = TRUE
        WHERE oi.order_id = ?
        ORDER BY oi.id
      `, [order.id]);
      order.items = items;
    }
    
    return NextResponse.json({ orders: processedOrders });
  } catch (error) {

    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}