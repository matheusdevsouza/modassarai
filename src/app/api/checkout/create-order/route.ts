import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { authenticateUser } from '@/lib/auth';
import { encryptForDatabase } from '@/lib/transparent-encryption';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
import { detectSQLInjection } from '@/lib/sql-injection-protection';
import { systemLogger } from '@/lib/system-logger';
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
});
const preference = new Preference(client);
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, shipping_address, payment_method } = body;
    if (customer) {
      const customerFields = [customer.name, customer.email, customer.phone, customer.cpf];
      for (const field of customerFields) {
        if (field && detectSQLInjection(field)) {
          return NextResponse.json(
            { error: 'Acesso negado - tentativa de ataque detectada' },
            { status: 403 }
          );
        }
      }
    }
    if (shipping_address) {
      const addressFields = [shipping_address.street, shipping_address.city, shipping_address.state, shipping_address.zipCode];
      for (const field of addressFields) {
        if (field && detectSQLInjection(field)) {
          return NextResponse.json(
            { error: 'Acesso negado - tentativa de ataque detectada' },
            { status: 403 }
          );
        }
      }
    }
    let user = null;
    try {
      user = await authenticateUser(request);
    } catch (error) {
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items do pedido são obrigatórios' },
        { status: 400 }
      );
    }
    if (!customer || !customer.email || !customer.name) {
      return NextResponse.json(
        { error: 'Dados do cliente são obrigatórios' },
        { status: 400 }
      );
    }
    if (!shipping_address) {
      return NextResponse.json(
        { error: 'Endereço de entrega é obrigatório' },
        { status: 400 }
      );
    }
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Dados dos items inválidos' },
          { status: 400 }
        );
      }
      const product = await database.query(
        'SELECT id, name, price FROM products WHERE id = ?',
        [item.product_id]
      );
      if (!product || product.length === 0) {
        return NextResponse.json(
          { error: `Produto com ID ${item.product_id} não encontrado` },
          { status: 400 }
        );
      }
      const productData = product[0];
      const price = parseFloat(productData.price);
      const quantity = parseInt(item.quantity);
      const itemTotal = price * quantity;
      total += itemTotal;
      const size: string | null = item.size ? String(item.size).trim() : null;
      if (size) {
        const sizeRows = await database.query(
          'SELECT stock_quantity, is_active FROM product_sizes WHERE product_id = ? AND size = ? LIMIT 1',
          [item.product_id, size]
        );
        if (!sizeRows || sizeRows.length === 0) {
          return NextResponse.json(
            { error: `Tamanho '${size}' indisponível para o produto ${productData.name}` },
            { status: 400 }
          );
        }
        const sizeData = sizeRows[0];
        if (!sizeData.is_active || Number(sizeData.stock_quantity) < quantity) {
          return NextResponse.json(
            { error: `Estoque insuficiente para o tamanho '${size}' do produto ${productData.name}` },
            { status: 400 }
          );
        }
      }
      orderItems.push({
        product_id: item.product_id,
        product_name: productData.name,
        size: size,
        color: item.color ? String(item.color) : null,
        quantity: quantity,
        price: price,
        total: itemTotal
      });
    }
    const subtotal = total;
    const shippingCost = shipping_address?.shipping_cost ? parseFloat(String(shipping_address.shipping_cost)) : 0.00;
    const finalTotal = subtotal + shippingCost;
    const orderNumber = `MP-${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const accessToken = randomUUID();
    const cpfCleaned = customer.cpf ? customer.cpf.replace(/\D/g, '') : '';
    const customerCpf = cpfCleaned && cpfCleaned.length === 11 ? cpfCleaned : null;
    
    const orderData = {
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_cpf: customerCpf,
      shipping_address: JSON.stringify(shipping_address)
    };
    
    const encryptedOrderData = encryptForDatabase('orders', orderData);
    
    const orderResult = await database.query(
      `INSERT INTO orders (
        user_id, order_number, access_token, status, payment_status, payment_method,
        subtotal, shipping_cost, tax_amount, discount_amount, total_amount, currency,
        customer_name, customer_email, customer_phone, customer_cpf, shipping_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user?.userId || null,
        orderNumber,
        accessToken,
        'pending',
        'pending',
        'Mercado Pago',
        subtotal,
        shippingCost,
        0.00,
        0.00,
        finalTotal,
        'BRL',
        encryptedOrderData.customer_name,
        encryptedOrderData.customer_email,
        encryptedOrderData.customer_phone,
        encryptedOrderData.customer_cpf,
        encryptedOrderData.shipping_address
      ]
    );
    const orderId = orderResult.insertId;
    for (const item of orderItems) {
      await database.query(
        'INSERT INTO order_items (order_id, product_id, variant_id, product_name, product_sku, size, color, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          orderId, 
          item.product_id, 
          null,
          item.product_name || 'Produto', 
          null,
          item.size || null,
          item.color || null,
          item.quantity, 
          item.price, 
          item.total
        ]
      );
    }
    try {
      const affectedProducts = new Set<number>();
      for (const item of orderItems) {
        if (item.size) {
          await database.query(
            `UPDATE product_sizes 
             SET stock_quantity = GREATEST(stock_quantity - ?, 0),
                 is_active = CASE WHEN (stock_quantity - ?) <= 0 THEN FALSE ELSE is_active END,
                 updated_at = NOW()
             WHERE product_id = ? AND size = ?`,
            [item.quantity, item.quantity, item.product_id, item.size]
          );
          affectedProducts.add(item.product_id);
        }
      }
      for (const pid of Array.from(affectedProducts)) {
        const totalRows = await database.query(
          'SELECT COALESCE(SUM(stock_quantity),0) AS total FROM product_sizes WHERE product_id = ? AND is_active = TRUE',
          [pid]
        );
        const totalStock = (totalRows?.[0]?.total) || 0;
        await database.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [totalStock, pid]);
      }
    } catch (invErr) {
    }
    try {
      const mpItems = orderItems.map(item => ({
        id: item.product_id.toString(),
        title: item.size ? `${item.product_name} - Tam ${item.size}` : item.product_name,
        quantity: item.quantity,
        unit_price: item.price
      }));

      if (shippingCost > 0) {
        mpItems.push({
          id: 'shipping',
          title: shipping_address.shipping_method || 'Frete',
          quantity: 1,
          unit_price: shippingCost
        });
      }

      const preferenceData = {
        items: mpItems,
        payer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone ? { number: customer.phone } : undefined
        },
        external_reference: orderNumber,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${orderNumber}`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure?order=${orderNumber}`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending?order=${orderNumber}`
        },
        auto_return: 'approved'
      };
      const preferenceResult = await preference.create({ body: preferenceData });
      
      const isProduction = process.env.NODE_ENV === 'production'
      const initPointUrl = isProduction
        ? (preferenceResult.init_point || preferenceResult.sandbox_init_point)
        : (preferenceResult.sandbox_init_point || preferenceResult.init_point);
      
      await database.query(
        'UPDATE orders SET external_reference = ?, init_point_url = ? WHERE id = ?',
        [preferenceResult.id, initPointUrl, orderId]
      );
      
      await systemLogger.logOrder('success', `Pedido criado: ${orderNumber}`, {
        request,
        userId: user?.userId,
        userEmail: customer.email,
        metadata: {
          orderId,
          orderNumber,
          total: finalTotal,
          itemCount: orderItems.length,
          paymentMethod: 'Mercado Pago'
        }
      });
      
      return NextResponse.json({
        success: true,
        orderId: orderId,
        orderNumber: orderNumber,
        accessToken: accessToken, 
        preferenceId: preferenceResult.id,
        total: finalTotal
      });
    } catch (mpError: any) {
      await database.query(
        'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
        ['cancelled', 'failed', orderId]
      );
      
      await systemLogger.logOrder('error', `Erro ao processar pagamento do pedido ${orderNumber}`, {
        request,
        userId: user?.userId,
        userEmail: customer.email,
        metadata: { 
          orderId, 
          orderNumber, 
          error: mpError.message,
          errorName: mpError.name,
          errorStack: mpError.stack
        }
      });
      
      return NextResponse.json(
        { error: 'Erro ao processar pagamento. Tente novamente.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    await systemLogger.logError('Erro ao criar pedido', {
      context: 'order',
      request,
      error,
      metadata: { endpoint: '/api/checkout/create-order' }
    });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}