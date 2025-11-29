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
    const categoryQuery = `
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
      WHERE c.id = ?
    `;
    const categories = await database.query(categoryQuery, [categoryId]);
    if (categories.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Categoria não encontrada'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: categories[0]
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function PATCH(
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
    const existingCategory = await database.query(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );
    if (existingCategory.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Categoria não encontrada'
      }, { status: 404 });
    }
    let slug = existingCategory[0].slug;
    if (body.name && body.name !== existingCategory[0].name) {
      let baseSlug = body.name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      let newSlug = baseSlug;
      let counter = 1;
      while (true) {
        const existingSlug = await database.query(
          'SELECT id FROM categories WHERE slug = ? AND id != ?',
          [newSlug, categoryId]
        );
        if (existingSlug.length === 0) break;
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      slug = newSlug;
    }
    const updateQuery = `
      UPDATE categories SET 
        name = ?, 
        slug = ?, 
        description = ?, 
        image_url = ?, 
        sort_order = ?, 
        is_active = ?, 
        updated_at = NOW()
      WHERE id = ?
    `;
    await database.query(updateQuery, [
      body.name || existingCategory[0].name,
      slug,
      body.description !== undefined ? body.description : existingCategory[0].description,
      body.image_url !== undefined ? body.image_url : existingCategory[0].image_url,
      body.sort_order !== undefined ? body.sort_order : existingCategory[0].sort_order,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : existingCategory[0].is_active,
      categoryId
    ]);
    const updatedCategory = await database.query(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );
    return NextResponse.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: updatedCategory[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
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
    const existingCategory = await database.query(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );
    if (existingCategory.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Categoria não encontrada'
      }, { status: 404 });
    }
    await database.query(
      `DELETE FROM product_categories
       WHERE category_id = ?
       AND NOT EXISTS (
         SELECT 1 FROM products p 
         WHERE p.id = product_categories.product_id AND p.is_active = TRUE
       )`,
      [categoryId]
    );
    const productsInCategories = await database.query(
      `SELECT COUNT(DISTINCT pc.product_id) as count 
       FROM product_categories pc
       INNER JOIN products p ON pc.product_id = p.id
       WHERE pc.category_id = ? AND p.is_active = TRUE`,
      [categoryId]
    );
    
    const countValue = productsInCategories[0]?.count;
    const totalProducts = typeof countValue === 'string' 
      ? parseInt(countValue, 10) 
      : (typeof countValue === 'number' ? Math.floor(countValue) : 0);
    
    if (isNaN(totalProducts) || totalProducts < 0) {
      console.error('Erro ao contar produtos:', { countValue, totalProducts, productsInCategories });
    }
    
    if (totalProducts > 0) {
      return NextResponse.json({
        success: false,
        error: `Não é possível excluir a categoria. Existem ${totalProducts} produto(s) ativo(s) associado(s) a ela. Remova os produtos antes de excluir a categoria.`
      }, { status: 400 });
    }
    
    await database.query(
      'DELETE FROM product_categories WHERE category_id = ?',
      [categoryId]
    );
    
    await database.query(
      'UPDATE products SET category_id = NULL WHERE category_id = ?',
      [categoryId]
    );
    
    const subcategories = await database.query(
      'SELECT id FROM subcategories WHERE category_id = ?',
      [categoryId]
    );
    
    if (subcategories && subcategories.length > 0) {
      for (const subcat of subcategories) {
        await database.query(
          'UPDATE products SET subcategory_id = NULL WHERE subcategory_id = ?',
          [subcat.id]
        );
      }
      
      await database.query(
        'DELETE FROM subcategories WHERE category_id = ?',
        [categoryId]
      );
    }
    await database.query('DELETE FROM categories WHERE id = ?', [categoryId]);
    return NextResponse.json({
      success: true,
      message: 'Categoria excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

