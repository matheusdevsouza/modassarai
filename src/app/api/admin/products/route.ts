import { NextRequest, NextResponse } from 'next/server'
import database from '@/lib/database'
import { authenticateUser, verifyAdminAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {

      return NextResponse.json(
        { success: false, error: 'Acesso negado. Autenticação necessária.' },
        { status: 401 }
      );
    }

    const isAdmin = await verifyAdminAccess(user, database.query);
    
    if (!isAdmin) {
      const dbCheck = await database.query('SELECT id, is_admin, email FROM users WHERE id = ?', [user.userId]);


      return NextResponse.json(
        { 
          success: false, 
          error: 'Acesso negado. Apenas administradores autorizados.',
          debug: process.env.NODE_ENV === 'development' ? {
            userId: user.userId,
            email: user.email,
            dbUser: dbCheck?.[0] ? {
              id: dbCheck[0].id,
              is_admin: dbCheck[0].is_admin,
              is_admin_type: typeof dbCheck[0].is_admin
            } : null
          } : undefined
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const model = searchParams.get('model') || 'all';
    const status = searchParams.get('status') || 'all';
    const newProducts = searchParams.get('newProducts') || 'false';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const skip = (page - 1) * limit;
    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        m.name as model_name,
        pi.image_url as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN models m ON p.model_id = m.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
    `;
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (search) {
      conditions.push(`(p.name LIKE ? OR p.description LIKE ?)`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    if (category !== 'all') {
      const categoryId = parseInt(category);
      if (!isNaN(categoryId)) {
        conditions.push(`p.category_id = ?`);
        params.push(categoryId);
      }
    }
    if (model !== 'all') {
      const modelId = parseInt(model);
      if (!isNaN(modelId)) {
        conditions.push(`p.model_id = ?`);
        params.push(modelId);
      }
    }
    if (status !== 'all') {
      conditions.push(`p.is_active = ?`);
      params.push(status === 'active' ? true : false);
    }
    if (newProducts === 'true') {
      conditions.push(`p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const validSortColumns = ['name', 'price', 'stock_quantity', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    if (safeSortBy === 'name') query += ` ORDER BY p.name ${safeSortOrder}`;
    else if (safeSortBy === 'price') query += ` ORDER BY p.price ${safeSortOrder}`;
    else if (safeSortBy === 'stock_quantity') query += ` ORDER BY p.stock_quantity ${safeSortOrder}`;
    else query += ` ORDER BY p.created_at ${safeSortOrder}`;
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, skip);
    
    const products = await database.query(query, params);
    
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN models m ON p.model_id = m.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
    `;
    const countParams: any[] = [];
    if (conditions.length > 0) {
      const countConditions = conditions.filter((cond, idx) => {
        if (cond.includes('DATE_SUB')) return true; 
        return true;
      });
      if (countConditions.length > 0) {
        countQuery += ' WHERE ' + countConditions.join(' AND ');
        if (search) {
          const searchTerm = `%${search}%`;
          countParams.push(searchTerm, searchTerm);
        }
        if (category !== 'all') {
          const categoryId = parseInt(category);
          if (!isNaN(categoryId)) {
            countParams.push(categoryId);
          }
        }
        if (model !== 'all') {
          const modelId = parseInt(model);
          if (!isNaN(modelId)) {
            countParams.push(modelId);
          }
        }
        if (status !== 'all') {
          countParams.push(status === 'active' ? true : false);
        }
      }
    }
    const countResult = await database.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    return NextResponse.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      data: {
        products: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      }
    }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Autenticação necessária.' },
        { status: 401 }
      );
    }
    
    const isAdmin = await verifyAdminAccess(user, database.query);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 403 }
      );
    }
    const body = await request.json()
    if (!body.name || !body.price) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios: nome e preço'
      }, { status: 400 });
    }
    let baseSlug = body.slug || body.name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existingProduct = await database.query(
        'SELECT id FROM products WHERE slug = ?',
        [slug]
      );
      if (existingProduct.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    if (body.sku) {
      const existingSku = await database.query(
        'SELECT id FROM products WHERE sku = ?',
        [body.sku]
      );
      if (existingSku.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'SKU já existe'
        }, { status: 400 });
      }
    }
    const price = typeof body.price === 'string' ? parseFloat(body.price) : body.price
    const original_price = body.original_price === null || body.original_price === undefined
      ? null
      : (typeof body.original_price === 'string' ? parseFloat(body.original_price) : body.original_price)
    const stock_quantity = body.stock_quantity !== undefined
      ? (typeof body.stock_quantity === 'string' ? parseInt(body.stock_quantity) : body.stock_quantity)
      : 0
    const min_stock_level = body.min_stock_level !== undefined
      ? (typeof body.min_stock_level === 'string' ? parseInt(body.min_stock_level) : body.min_stock_level)
      : 5
    let category_id = typeof body.category_id === 'string' ? parseInt(body.category_id) : body.category_id
    if (!category_id || Number.isNaN(category_id)) {
      const rows = await database.query(
        'SELECT id FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC LIMIT 1'
      )
      if (Array.isArray(rows) && rows.length > 0 && rows[0]?.id) {
        category_id = rows[0].id
      } else {
        const insertCat = await database.query(
          `INSERT INTO categories (name, slug, description, is_active, sort_order, created_at) VALUES (?, ?, ?, TRUE, 999, NOW())`,
          ['Uncategorized', 'uncategorized', null]
        )
        category_id = insertCat.insertId
      }
    }
    const model_id = body.model_id ? (typeof body.model_id === 'string' ? parseInt(body.model_id) : body.model_id) : null
    const insertQuery = `
      INSERT INTO products (
        name, slug, description, short_description, sku,
        price, original_price, stock_quantity, min_stock_level,
        category_id, model_id,
        is_active, is_featured, is_new, is_bestseller,
        created_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        NOW()
      )
    `;
    const productData = [
      body.name,
      slug,
      body.description || '',
      body.short_description || null,
      body.sku || null,
      price,
      original_price,
      stock_quantity,
      min_stock_level,
      category_id,
      model_id,
      body.is_active !== false,
      body.is_featured ? true : false,
      body.is_new ? true : false,
      body.is_bestseller ? true : false
    ];
    const result = await database.query(insertQuery, productData);
    const productId = result.insertId;
    return NextResponse.json({
      success: true,
      message: 'Produto criado com sucesso',
      data: { id: productId, slug },
      product: { id: productId, slug }
    });
  } catch (error) {

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}