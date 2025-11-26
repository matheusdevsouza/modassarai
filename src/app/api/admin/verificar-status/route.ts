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
          tokenIsAdmin: false,
          dbIsAdmin: false,
          userId: null,
          email: null,
          name: null
        },
        { status: 401 }
      );
    }

    const tokenIsAdmin = isAdmin(user);
    const dbIsAdmin = await verifyAdminFromDatabase(user.userId, database.query);

    return NextResponse.json({
      success: true,
      tokenIsAdmin,
      dbIsAdmin,
      userId: user.userId,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Erro ao verificar status de admin:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        tokenIsAdmin: false,
        dbIsAdmin: false,
        userId: null,
        email: null,
        name: null
      },
      { status: 500 }
    );
  }
}


