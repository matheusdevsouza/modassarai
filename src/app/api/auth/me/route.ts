import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, isAuthenticated, isEmailVerified } from '@/lib/auth';
import database from '@/lib/database';
import { processSafeUserData } from '@/lib/safe-user-data';
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateUser(request);
    if (!isAuthenticated(payload)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Não autenticado',
          authenticated: false 
        },
        { status: 401 }
      );
    }
    if (!payload) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token inválido',
          authenticated: false 
        },
        { status: 401 }
      );
    }
    const users = await database.query('SELECT * FROM users WHERE id = ?', [payload.userId]);
    if (!users || users.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuário não encontrado',
          authenticated: false 
        },
        { status: 404 }
      );
    }
    const user = users[0];
    const safeUser = processSafeUserData(user);
    return NextResponse.json(
      { 
        success: true, 
        message: 'Usuário autenticado',
        authenticated: true,
        emailVerified: isEmailVerified(payload),
        user: safeUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        authenticated: false 
      },
      { status: 500 }
    );
  }
}