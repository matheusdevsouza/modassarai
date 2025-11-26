import { NextRequest, NextResponse } from 'next/server';
import { getUserByUuid } from '@/lib/database';
import { authenticateUser, isAuthenticated } from '@/lib/auth';
import { processSafeUserData } from '@/lib/safe-user-data';
export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const payload = await authenticateUser(request);
    if (!isAuthenticated(payload)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Não autenticado' 
        },
        { status: 401 }
      );
    }
    const { uuid } = params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'UUID inválido' 
        },
        { status: 400 }
      );
    }
    const user = await getUserByUuid(uuid);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuário não encontrado' 
        },
        { status: 404 }
      );
    }
    if (payload && (payload.userId !== user.id && !payload.isAdmin)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Acesso negado' 
        },
        { status: 403 }
      );
    }
    const safeUser = processSafeUserData(user);
    return NextResponse.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('Erro ao buscar usuário por UUID:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}