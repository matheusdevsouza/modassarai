import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import database from '@/lib/database';
import { sendVerificationEmail } from '@/lib/email';
import { hashPassword, validatePasswordStrength } from '@/lib/auth';
import { processSafeUserData } from '@/lib/safe-user-data';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(ip, 'register', request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Muitas tentativas. Tente novamente em ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60)} minutos.`,
        },
        { status: 429 }
      );
    }
    const body = await request.json();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const confirmPassword = body.confirmPassword || '';
    const phone = body.phone ? String(body.phone).trim().substring(0, 50) : null;
    const cpf = body.cpf ? String(body.cpf).trim() : null;
    const birthDate = body.birth_date ? String(body.birth_date).trim() : null;
    const gender = body.gender || null;
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      );
    }
    if (name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Nome deve ter pelo menos 2 caracteres' },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'As senhas não coincidem' },
        { status: 400 }
      );
    }
    const passwordStrength = validatePasswordStrength(password);
    if (!passwordStrength.isValid) {
      return NextResponse.json(
        { success: false, message: passwordStrength.errors[0] || 'Senha não atende aos requisitos mínimos' },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'E-mail inválido' },
        { status: 400 }
      );
    }
    const existingUser = await database.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'E-mail já cadastrado' },
        { status: 400 }
      );
    }
    const hashedPassword = await hashPassword(password);
    const userResult = await database.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      cpf,
      birth_date: birthDate,
      gender,
    });
    const userId = userResult?.insertId || userResult?.rows?.[0]?.id;
    if (!userId) {
      throw new Error('Falha ao criar usuário');
    }
    const createdUser = await database.getUserById(userId);
    if (!createdUser) {
      throw new Error('Usuário criado não encontrado');
    }
    const verificationToken = crypto.randomBytes(48).toString('hex');
    await database.createVerificationToken(userId, verificationToken);
    try {
      await sendVerificationEmail({
        email,
        name,
        verificationToken,
      });
    } catch (emailError) {
      console.error('Erro ao enviar email de verificação:', emailError);
    }
    const safeUser = processSafeUserData(createdUser);
    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso! Verifique seu e-mail para ativar a conta.',
      user: safeUser,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetTime,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}