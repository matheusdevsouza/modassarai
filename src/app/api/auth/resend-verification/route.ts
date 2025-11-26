import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import database from '@/lib/database';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(ip, 'emailVerification', request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Muitas solicitações. Tente novamente em ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60)} minutos.`,
        },
        { status: 429 }
      );
    }
    const body = await request.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'E-mail é obrigatório' },
        { status: 400 }
      );
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await database.getUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    if (user.email_verified_at) {
      return NextResponse.json(
        { success: false, message: 'E-mail já foi verificado' },
        { status: 400 }
      );
    }
    await database.query(
      `DELETE FROM email_verification_tokens WHERE user_id = ?`,
      [user.id]
    );
    const verificationToken = crypto.randomBytes(48).toString('hex');
    await database.createVerificationToken(user.id, verificationToken);
    await sendVerificationEmail({
      email: normalizedEmail,
      name: user.name || user.display_name || 'Usuário',
      verificationToken
    });
    return NextResponse.json({
      success: true,
      message: 'E-mail de verificação reenviado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao reenviar verificação:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}