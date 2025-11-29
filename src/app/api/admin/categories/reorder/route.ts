import { NextRequest, NextResponse } from 'next/server'
import database from '@/lib/database'
import { authenticateUser, verifyAdminAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic';

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
    const { categories } = body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lista de categorias é obrigatória' },
        { status: 400 }
      );
    }

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      if (!category.id || category.sort_order === undefined) {
        continue;
      }
      
      await database.query(
        'UPDATE categories SET sort_order = ?, updated_at = NOW() WHERE id = ?',
        [i + 1, category.id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ordem das categorias atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao reordenar categorias:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}


