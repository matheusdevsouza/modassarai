import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { authenticateUser, verifyAdminAccess } from '@/lib/auth';
import { decryptFromDatabase } from '@/lib/transparent-encryption';
import { processSafeUserData } from '@/lib/safe-user-data';
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
    let whereClause = '';
    const params: any[] = [];
    if (search) {
      whereClause = ' WHERE (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    const offset = (page - 1) * limit;
    const users = await database.query(`
      SELECT 
        u.id, 
        u.user_uuid,
        u.name, 
        u.display_name,
        u.email, 
        u.phone, 
        u.address, 
        u.is_admin, 
        u.is_active, 
        u.email_verified_at,
        u.created_at, 
        u.updated_at,
        u.last_login,
        COALESCE(order_stats.order_count, 0) as orderCount,
        COALESCE(order_stats.total_spent, 0) as totalSpent
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as order_count,
          SUM(total_amount) as total_spent
        FROM orders 
        GROUP BY user_id
      ) order_stats ON u.id = order_stats.user_id
      ${whereClause}
      ORDER BY u.created_at DESC 
      LIMIT ? OFFSET ?
    `, [...params, limit.toString(), offset.toString()]);
    const totalResult = await database.query(`
      SELECT COUNT(*) as total FROM users 
      ${whereClause}
    `, params);
    const totalUsers = totalResult[0].total;
    const decryptedUsers = users.map((user: any) => {
      const decryptedUser = decryptFromDatabase('users', user);
      const safeUser = processSafeUserData(decryptedUser);
      return {
        id: safeUser.id,
        internalId: safeUser.internalId,
        name: safeUser.name || 'Nome não informado',
        email: safeUser.email || 'Email não informado',
        phone: safeUser.phone,
        address: safeUser.address,
        role: safeUser.is_admin ? 'admin' : 'user',
        status: safeUser.is_active ? 'active' : 'inactive',
        emailVerified: Boolean(safeUser.email_verified_at),
        orderCount: parseInt(user.orderCount) || 0,
        totalSpent: parseFloat(user.totalSpent) || 0,
        lastLogin: safeUser.last_login ? new Date(safeUser.last_login).toLocaleDateString('pt-BR') : null,
        createdAt: safeUser.created_at,
        updatedAt: safeUser.updated_at
      };
    });
    return NextResponse.json({
      success: true,
      data: {
        users: decryptedUsers,
        pagination: {
          page,
          limit,
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
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
    return NextResponse.json(
      { success: false, error: 'Método não implementado' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}