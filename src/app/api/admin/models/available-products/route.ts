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
    const excludeModelId = searchParams.get('excludeModelId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    let query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.stock_quantity,
        p.model_id,
        b.name as brand_name,
        m.name as current_model_name,
        pi.image_url as primary_image
      FROM products p
      LEFT JOIN models m ON p.model_id = m.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE p.is_active = TRUE
    `;
    const params = [];
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR b.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (excludeModelId) {
      query += ' AND (p.model_id IS NULL OR p.model_id != ?)';
      params.push(parseInt(excludeModelId));
    }
    query += ' ORDER BY p.name ASC';
    query += ` LIMIT ${limit} OFFSET ${skip}`;
    const products = await database.query(query, params);
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      WHERE p.is_active = TRUE
    `;
    const countParams = [];
    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ? OR b.name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (excludeModelId) {
      countQuery += ' AND (p.model_id IS NULL OR p.model_id != ?)';
      countParams.push(parseInt(excludeModelId));
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

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}