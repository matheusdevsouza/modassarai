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
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const skip = (page - 1) * limit;
    let query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
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
    query += ' GROUP BY c.id';
    const validSortColumns = ['name', 'created_at', 'updated_at', 'sort_order'];
    const validSortOrders = ['asc', 'desc'];
    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}`;
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
    return NextResponse.json({
      success: true,
      data: {
        models: categories,
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
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
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
    if (!body.name) {
      return NextResponse.json({
        success: false,
        error: 'Nome da categoria é obrigatório'
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
      const existingCategory = await database.query(
        'SELECT id FROM categories WHERE slug = ?',
        [slug]
      );
      if (existingCategory.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    const insertQuery = `
      INSERT INTO categories (
        name, slug, description, image_url, sort_order, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const result = await database.query(insertQuery, [
      body.name,
      slug,
      body.description || null,
      body.image_url || null,
      body.sort_order || 0,
      body.is_active !== undefined ? (body.is_active ? true : false) : true
    ]);
    const newCategory = await database.query(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );
    return NextResponse.json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: newCategory[0]
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}