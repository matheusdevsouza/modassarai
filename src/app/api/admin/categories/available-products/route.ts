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
    const search = searchParams.get('search') || '';
    const excludeCategoryId = searchParams.get('excludeCategoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    let query = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.stock_quantity,
        b.name as brand_name,
        COALESCE(
          (SELECT c.name FROM categories c
           INNER JOIN product_categories pc ON c.id = pc.category_id
           WHERE pc.product_id = p.id
           LIMIT 1),
          NULL
        ) as current_category_name,
        pi.image_url as primary_image
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE p.is_active = TRUE
    `;
    const params = [];
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR b.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (excludeCategoryId) {
      query += ` AND NOT EXISTS (
        SELECT 1 FROM product_categories pc
        WHERE pc.product_id = p.id AND pc.category_id = ?
      )`;
      params.push(parseInt(excludeCategoryId));
    }
    query += ' ORDER BY p.name ASC';
    query += ` LIMIT ${limit} OFFSET ${skip}`;
    const products = await database.query(query, params);
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total 
      FROM products p
      WHERE p.is_active = TRUE
    `;
    const countParams = [];
    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ? OR b.name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (excludeCategoryId) {
      countQuery += ` AND NOT EXISTS (
        SELECT 1 FROM product_categories pc
        WHERE pc.product_id = p.id AND pc.category_id = ?
      )`;
      countParams.push(parseInt(excludeCategoryId));
    }
    const countResult = await database.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const pages = Math.ceil(total / limit);
    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          pages,
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produtos disponíveis:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}


