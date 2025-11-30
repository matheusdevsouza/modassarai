import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { verify2FACode } from '@/lib/two-factor-auth';
import { loginWithEncryptedData } from '@/lib/auth';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { decryptFromDatabase } from '@/lib/transparent-encryption';
import { processSafeUserData } from '@/lib/safe-user-data';
import { detectSQLInjection } from '@/lib/sql-injection-protection';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, code, sessionToken } = body;
    
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedCode = (code || '').replace(/\s/g, ''); 
    
    if (detectSQLInjection(normalizedEmail) || detectSQLInjection(password, true) || detectSQLInjection(normalizedCode)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Acesso negado - tentativa de ataque detectada' 
        },
        { status: 403 }
      );
    }
    
    if (!normalizedEmail || !password || !normalizedCode || !sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }
    
    if (normalizedCode.length !== 6 || !/^\d+$/.test(normalizedCode)) {
      return NextResponse.json(
        { success: false, message: 'Código inválido. Deve conter 6 dígitos numéricos.' },
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
    
    const verificationResult = await verify2FACode(
      sessionToken,
      normalizedCode,
      user.id,
      userEmail 
    );
    
    if (!verificationResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          message: verificationResult.error || 'Código inválido ou expirado' 
        },
        { status: 401 }
      );
    }
    
    await database.updateUserLastLogin(user.id);
    const safeUser = processSafeUserData(user);
    
    const tokenPayload = {
      userId: safeUser.internalId,
      email: safeUser.email,
      name: safeUser.name,
      emailVerified: !!safeUser.email_verified_at,
      isAdmin: !!safeUser.is_admin,
    };
    
    const token = generateToken(tokenPayload);
    
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login realizado com sucesso!',
        user: safeUser
      },
      { status: 200 }
    );
    
    return setAuthCookie(response, token);
    
  } catch (error) {
    console.error('Erro ao verificar código 2FA:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor. Tente novamente.' 
      },
      { status: 500 }
    );
  }
}

