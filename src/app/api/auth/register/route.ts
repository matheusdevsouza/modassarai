import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import database from '@/lib/database';
import { sendVerificationEmail } from '@/lib/email';
import { hashPassword, validatePasswordStrength } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import { processSafeUserData } from '@/lib/safe-user-data';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { systemLogger } from '@/lib/system-logger';
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
    let phone = body.phone && String(body.phone).trim() ? String(body.phone).trim().substring(0, 50) : null;
    let cpf = body.cpf ? String(body.cpf).trim() : null;
    
    if (phone && !phone.match(/^\+?[0-9]{10,15}$/) && !phone.match(/^\([0-9]{2}\)\s?[0-9]{4,5}-?[0-9]{4}$/)) {
      return NextResponse.json(
        { success: false, message: 'Formato de telefone inválido' },
        { status: 400 }
      );
    }
    
    if (cpf && !cpf.match(/^[0-9]{11}$/) && !cpf.match(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/)) {
      return NextResponse.json(
        { success: false, message: 'Formato de CPF inválido' },
        { status: 400 }
      );
    }
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
      phone: phone ?? null,
      cpf: cpf ?? null,
      birth_date: birthDate ?? null,
      gender: gender ?? null,
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

    }
    const safeUser = processSafeUserData(createdUser);
    
    await systemLogger.logUser('success', 'Novo usuário registrado', {
      request,
      userId: userId,
      userName: name,
      userEmail: email,
      metadata: { ip, phone: phone ? 'provided' : 'not_provided' }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso! Verifique seu e-mail para ativar a conta.',
      user: safeUser,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetTime,
      },
    });
  } catch (error: any) {
    await systemLogger.logError('Erro durante registro de usuário', {
      context: 'auth',
      request,
      error,
      metadata: { endpoint: '/api/auth/register', email: body?.email }
    });
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}