import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { 
  create2FACode, 
  checkRateLimit, 
  generateSessionToken,
  getClientIP,
  getUserAgent
} from '@/lib/two-factor-auth';
import { findUserByEmail, decryptFromDatabase } from '@/lib/transparent-encryption';
import { loginWithEncryptedData } from '@/lib/auth';
import { send2FACodeEmail } from '@/lib/email';
import { detectSQLInjection } from '@/lib/sql-injection-protection';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    const normalizedEmail = (email || '').trim().toLowerCase();
    
    if (detectSQLInjection(normalizedEmail) || detectSQLInjection(password, true)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Acesso negado - tentativa de ataque detectada' 
        },
        { status: 403 }
      );
    }
    
    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    const loginResult = await loginWithEncryptedData(normalizedEmail, password, database.query);
    
    if (!loginResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'E-mail ou senha incorretos' 
        },
        { status: 401 }
      );
    }
    
    const user = decryptFromDatabase('users', loginResult.user);
    
    if (!user.email_verified_at) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'E-mail não verificado. Verifique sua caixa de entrada.' 
        },
        { status: 401 }
      );
    }
    
    if (!user.is_active) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Conta desativada. Entre em contato conosco.' 
        },
        { status: 401 }
      );
    }
    
    const userEmail = user.email.toLowerCase().trim();
    
    const emailRateLimit = await checkRateLimit(userEmail, 'email');
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Muitas tentativas. Tente novamente em ${Math.ceil(emailRateLimit.retryAfter / 60)} minuto(s).`,
          retryAfter: emailRateLimit.retryAfter
        },
        { status: 429 }
      );
    }
    
    const ip = getClientIP(request);
    const ipRateLimit = await checkRateLimit(ip, 'ip');
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Muitas tentativas. Tente novamente em ${Math.ceil(ipRateLimit.retryAfter / 60)} minuto(s).`,
          retryAfter: ipRateLimit.retryAfter
        },
        { status: 429 }
      );
    }
    
    const sessionToken = generateSessionToken();
    
    const { code, expiresAt } = await create2FACode(
      user.id,
      userEmail, 
      sessionToken,
      ip,
      getUserAgent(request)
    );
    
    await send2FACodeEmail({
      email: userEmail,
      name: user.name,
      code: code
    });
    
    return NextResponse.json({
      success: true,
      message: 'Código enviado para seu e-mail',
      sessionToken: sessionToken, 
      expiresAt: expiresAt.toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao enviar código 2FA:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor. Tente novamente.' 
      },
      { status: 500 }
    );
  }
}

