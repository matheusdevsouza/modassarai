import { NextRequest, NextResponse } from 'next/server';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { 
  getVerificationToken, 
  markVerificationTokenAsUsed, 
  updateUserEmailVerification,
  getUserById
} from '@/lib/database';
import { processSafeUserData } from '@/lib/safe-user-data';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de verificação é obrigatório' },
        { status: 400 }
      );
    }
    const verificationData = await getVerificationToken(token);
    if (!verificationData) {
      return NextResponse.json(
        { success: false, message: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }
    await markVerificationTokenAsUsed(token);
    await updateUserEmailVerification(verificationData.user_id);
    const user = await getUserById(verificationData.user_id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado para este token' },
        { status: 404 }
      );
    }
    const safeUser = processSafeUserData(user);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [VERIFY EMAIL] User data:', {
        rawName: user.name,
        safeName: safeUser.name,
        displayName: safeUser.display_name,
        email: safeUser.email
      });
    }
    
    const tokenPayload = {
      userId: safeUser.internalId,
      email: safeUser.email,
      name: safeUser.name,
      emailVerified: true,
      isAdmin: Boolean(safeUser.is_admin),
    };
    const authToken = generateToken(tokenPayload);
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'E-mail verificado com sucesso! Você já está logado.',
        user: {
          ...safeUser,
          emailVerified: true,
        }
      },
      { status: 200 }
    );
    return setAuthCookie(response, authToken);
  } catch (error) {
    console.error('Erro na verificação de e-mail:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}