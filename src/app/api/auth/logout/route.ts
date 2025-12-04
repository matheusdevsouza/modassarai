import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies, verifyToken, getTokenFromRequest } from '@/lib/auth';
import { systemLogger } from '@/lib/system-logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    let userId: number | undefined;
    let userEmail: string | undefined;
    
    if (token) {
      try {
        const payload = verifyToken(token);
        if (payload) {
          userId = payload.userId;
          userEmail = payload.email;
        }
      } catch (error) {
      }
    }
    
    await systemLogger.logAuth('info', 'Logout realizado', {
      request,
      userId,
      userEmail,
      metadata: { ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown' }
    });
    
    const response = NextResponse.json(
      { success: true, message: 'Logout realizado com sucesso!' },
      { status: 200 }
    );
    return clearAuthCookies(response, request);
  } catch (error: any) {
    await systemLogger.logError('Erro durante logout', {
      context: 'auth',
      request,
      error
    });
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}