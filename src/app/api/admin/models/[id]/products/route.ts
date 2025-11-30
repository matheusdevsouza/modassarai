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
    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        error: 'ID da categoria inválido'
      }, { status: 400 });
    }
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.stock_quantity,
        p.is_active,
        b.name as brand_name,
        pi.image_url as primary_image
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE p.category_id = ? AND p.is_active = TRUE
      ORDER BY p.name ASC
    `;
    const products = await database.query(productsQuery, [categoryId]);
    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Erro ao buscar produtos da categoria:', error);
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
    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        error: 'ID da categoria inválido'
      }, { status: 400 });
    }
    const body = await request.json();
    const { productIds } = body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Lista de produtos é obrigatória'
      }, { status: 400 });
    }
    const categoryExists = await database.query(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    );
    if (categoryExists.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Categoria não encontrada'
      }, { status: 404 });
    }
    const placeholders = productIds.map(() => '?').join(',');
    const productsExist = await database.query(
      `SELECT id FROM products WHERE id IN (${placeholders}) AND is_active = TRUE`,
      productIds
    );
    if (productsExist.length !== productIds.length) {
      return NextResponse.json({
        success: false,
        error: 'Um ou mais produtos não foram encontrados'
      }, { status: 400 });
    }
    await database.query(
      `UPDATE products SET category_id = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [categoryId, ...productIds]
    );
    return NextResponse.json({
      success: true,
      message: `${productIds.length} produto(s) adicionado(s) à categoria com sucesso`
    });
  } catch (error) {
    console.error('Erro ao adicionar produtos à categoria:', error);
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
    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        error: 'ID da categoria inválido'
      }, { status: 400 });
    }
    const body = await request.json();
    const { productIds } = body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Lista de produtos é obrigatória'
      }, { status: 400 });
    }
    const placeholders = productIds.map(() => '?').join(',');
    await database.query(
      `UPDATE products SET category_id = NULL, updated_at = NOW() WHERE id IN (${placeholders}) AND category_id = ?`,
      [...productIds, categoryId]
    );
    return NextResponse.json({
      success: true,
      message: `${productIds.length} produto(s) removido(s) da categoria com sucesso`
    });
  } catch (error) {
    console.error('Erro ao remover produtos da categoria:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}