import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, isAdmin, verifyAdminFromDatabase } from '@/lib/auth';
import database from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuário não autenticado',
          debug: {
            authenticated: false,
            userId: null
          }
        },
        { status: 401 }
      );
    }

    const dbUsers = await database.query('SELECT id, is_admin, is_active, email_verified_at FROM users WHERE id = ?', [user.userId]);
    
    const dbUser = dbUsers && dbUsers.length > 0 ? dbUsers[0] : null;
    const dbIsAdminRaw = dbUser?.is_admin;
    const dbIsAdmin = await verifyAdminFromDatabase(user.userId, database.query);
    const tokenIsAdmin = isAdmin(user);

    const checks = {
      rawValue: dbIsAdminRaw,
      rawType: typeof dbIsAdminRaw,
      equals1: dbIsAdminRaw === 1,
      equalsTrue: dbIsAdminRaw === true,
      equalsString1: dbIsAdminRaw === '1',
      equalsStringTrue: dbIsAdminRaw === 'true' || dbIsAdminRaw === 'TRUE',
      booleanConversion: Boolean(dbIsAdminRaw),
      verifyFunctionResult: dbIsAdmin
    };

    return NextResponse.json({
      success: true,
      debug: {
        userId: user.userId,
        email: user.email,
        tokenIsAdmin,
        dbIsAdmin,
        dbUser: dbUser ? {
          id: dbUser.id,
          is_admin: dbUser.is_admin,
          is_admin_type: typeof dbUser.is_admin,
          is_active: dbUser.is_active,
          email_verified_at: dbUser.email_verified_at
        } : null,
        checks,
        recommendation: !dbIsAdmin 
          ? 'O usuário não é admin no banco de dados. Verifique se o campo is_admin está como true/1 no banco.'
          : !tokenIsAdmin
          ? 'O usuário é admin no banco, mas o token JWT está desatualizado. Faça logout e login novamente.'
          : 'Tudo está correto!'
      }
    });
  } catch (error) {
    console.error('Erro no debug de admin:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        debug: {
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }
      },
      { status: 500 }
    );
  }
}


