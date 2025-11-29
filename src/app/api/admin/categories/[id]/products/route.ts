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
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE p.is_active = TRUE
      ORDER BY p.name ASC
    `;
    
    const products = await database.query(productsQuery);

    const productIds = products.map((p: any) => p.id);
    let categoriesByProduct: { [key: number]: Array<{ id: number; name: string; slug: string }> } = {};
    
    if (productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(',');
      const categoriesQuery = `
        SELECT 
          pc.product_id,
          c.id,
          c.name,
          c.slug
        FROM product_categories pc
        INNER JOIN categories c ON pc.category_id = c.id
        WHERE pc.product_id IN (${placeholders})
        ORDER BY c.name ASC
      `;
      const categories = await database.query(categoriesQuery, productIds);
      
      categories.forEach((cat: any) => {
        if (!categoriesByProduct[cat.product_id]) {
          categoriesByProduct[cat.product_id] = [];
        }
        categoriesByProduct[cat.product_id].push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        });
      });
    }

    const associatedProductsQuery = `
      SELECT product_id 
      FROM product_categories 
      WHERE category_id = ?
    `;
    const associatedProducts = await database.query(associatedProductsQuery, [categoryId]);
    const associatedProductIds = new Set(associatedProducts.map((p: any) => p.product_id));
    const productsWithAssociation = products.map((product: any) => ({
      ...product,
      categories: categoriesByProduct[product.id] || [],
      isAssociated: associatedProductIds.has(product.id)
    }));

    return NextResponse.json({
      success: true,
      data: productsWithAssociation
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
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

    let addedCount = 0;
    for (const productId of productIds) {
      try {
        const existing = await database.query(
          'SELECT id FROM product_categories WHERE product_id = ? AND category_id = ?',
          [productId, categoryId]
        );
        
        if (existing.length === 0) {
          await database.query(
            `INSERT INTO product_categories (product_id, category_id, created_at, updated_at)
             VALUES (?, ?, NOW(), NOW())`,
            [productId, categoryId]
          );
          addedCount++;
        }
      } catch (error: any) {
        if (!error.message?.includes('duplicate') && !error.code?.includes('23505')) {
          console.error('Erro ao adicionar categoria ao produto:', error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${addedCount} produto(s) adicionado(s) à categoria com sucesso`
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
    const result = await database.query(
      `DELETE FROM product_categories 
       WHERE product_id IN (${placeholders}) AND category_id = ?`,
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

