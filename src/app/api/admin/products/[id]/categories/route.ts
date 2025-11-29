import { NextRequest, NextResponse } from 'next/server'
import database from '@/lib/database'
import { authenticateUser, verifyAdminAccess } from '@/lib/auth'

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

    const categoriesQuery = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image_url
      FROM categories c
      INNER JOIN product_categories pc ON c.id = pc.category_id
      WHERE pc.product_id = ?
      ORDER BY c.name ASC
    `;
    
    const categories = await database.query(categoriesQuery, [productId]);

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Erro ao buscar categorias do produto:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function POST(
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

    const body = await request.json();
    const { categoryId } = body;
    
    if (!categoryId || isNaN(parseInt(categoryId))) {
      return NextResponse.json({
        success: false,
        error: 'ID da categoria é obrigatório'
      }, { status: 400 });
    }

    const categoryIdInt = parseInt(categoryId);

    const productExists = await database.query(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE',
      [productId]
    );
    if (productExists.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 });
    }

    const categoryExists = await database.query(
      'SELECT id FROM categories WHERE id = ?',
      [categoryIdInt]
    );
    if (categoryExists.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Categoria não encontrada'
      }, { status: 404 });
    }

    const existing = await database.query(
      'SELECT id FROM product_categories WHERE product_id = ? AND category_id = ?',
      [productId, categoryIdInt]
    );
    
    if (existing.length === 0) {
      await database.query(
        `INSERT INTO product_categories (product_id, category_id, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
        [productId, categoryIdInt]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Categoria adicionada ao produto com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar categoria ao produto:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function DELETE(
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
    const categoryId = searchParams.get('categoryId');
    
    if (!categoryId || isNaN(parseInt(categoryId))) {
      return NextResponse.json({
        success: false,
        error: 'ID da categoria é obrigatório'
      }, { status: 400 });
    }

    const categoryIdInt = parseInt(categoryId);

    await database.query(
      'DELETE FROM product_categories WHERE product_id = ? AND category_id = ?',
      [productId, categoryIdInt]
    );

    return NextResponse.json({
      success: true,
      message: 'Categoria removida do produto com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover categoria do produto:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

