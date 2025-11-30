import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createPasswordResetToken, deleteExpiredPasswordResetTokens } from '@/lib/database'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkRateLimit, getClientIP, normalizeEmailForRateLimit } from '@/lib/rate-limit'
import crypto from 'crypto'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    
    const ipRateLimit = checkRateLimit(ip, 'passwordResetRequest', request)
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Muitas solicitações de recuperação de senha. Tente novamente em ${Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000 / 60)} minutos.`
        },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    const { email } = body || {}
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      )
    }
    const normalizedEmail = normalizeEmailForRateLimit(email)
    
    const emailRateLimit = checkRateLimit(normalizedEmail, 'passwordResetRequest', request)
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Muitas solicitações para este e-mail. Tente novamente em ${Math.ceil((emailRateLimit.resetTime - Date.now()) / 1000 / 60)} minutos.`
        },
        { status: 429 }
      )
    }
    const user = await getUserByEmail(normalizedEmail)
    await deleteExpiredPasswordResetTokens()
    
    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      await createPasswordResetToken(user.id, token)
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name || "Usuário",
        resetToken: token
      })
    }
    return NextResponse.json(
      { 
        message: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição em breve.',
        success: true 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro em forgot-password:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}