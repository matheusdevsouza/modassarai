import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { authenticateUser, verifyAdminAccess } from '@/lib/auth';

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
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'sort_order';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const skip = (page - 1) * limit;
    
    let query = `
      SELECT 
        c.*,
        COALESCE(
          (SELECT COUNT(DISTINCT pc.product_id) 
           FROM product_categories pc
           INNER JOIN products p ON pc.product_id = p.id
           WHERE pc.category_id = c.id AND p.is_active = TRUE),
          0
        ) as product_count
       FROM categories c 
    `;
    const conditions = [];
    const params = [];
    if (search) {
      conditions.push(`(c.name LIKE ? OR c.description LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status !== 'all') {
      conditions.push(`c.is_active = ?`);
      params.push(status === 'active' ? true : false);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    const validSortColumns = ['name', 'created_at', 'updated_at', 'sort_order'];
    const validSortOrders = ['asc', 'desc'];
    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY c.sort_order ASC`;
    }
    query += ` LIMIT ${limit} OFFSET ${skip}`;
    const categories = await database.query(query, params);
    
    let countQuery = `SELECT COUNT(DISTINCT c.id) as total FROM categories c`;
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await database.query(countQuery, params);
    const total = countResult[0]?.total || 0;
    const pages = Math.ceil(total / limit);
    
    const mappedCategories = categories.map((cat: any) => ({
      ...cat,
      is_active: Boolean(cat.is_active),
      subcategories: [], 
      _count: {
        products: cat.product_count || 0
      }
    }));
    return NextResponse.json({
      success: true,
      data: {
        categories: mappedCategories,
        pagination: {
          page,
          pages,
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
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
    const body = await request.json();
    const { name, description, image_url, sort_order, is_active } = body;
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      );
    }
    const slug = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    const isActive = is_active !== undefined ? Boolean(is_active) : true;
    const result = await database.query(
      `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name.trim(), slug, description || null, image_url || null, sort_order ? parseInt(sort_order) : 0, isActive]
    );
    return NextResponse.json({
      success: true,
      data: { id: result.insertId, name: name.trim(), slug, description, image_url, sort_order, is_active: isActive },
      message: 'Categoria criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}