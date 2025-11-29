import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { authenticateUser, verifyAdminAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({
        success: false,
        error: 'ID do produto inválido'
      }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image_url,
        c.is_active,
        c.sort_order,
        CASE 
          WHEN pc.category_id IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END as is_associated
      FROM categories c
      LEFT JOIN product_categories pc ON c.id = pc.category_id AND pc.product_id = ?
      WHERE c.is_active = TRUE
    `;

    const paramsArray: any[] = [productId];

    if (search) {
      query += ` AND (c.name LIKE ? OR c.slug LIKE ?)`;
      const searchPattern = `%${search}%`;
      paramsArray.push(searchPattern, searchPattern);
    }

    query += ` ORDER BY c.sort_order ASC, c.name ASC LIMIT 50`;

    const categories = await database.query(query, paramsArray);

    return NextResponse.json({
      success: true,
      data: {
        categories: categories || []
      }
    });
  } catch (error) {
    console.error('Erro ao buscar categorias disponíveis:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

