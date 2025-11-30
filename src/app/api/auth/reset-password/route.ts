import { NextRequest, NextResponse } from 'next/server'
import { getPasswordResetToken, markPasswordResetTokenAsUsed, updateUserPassword } from '@/lib/database'
import database from '@/lib/database'
import { hashPassword, validatePasswordStrength } from '@/lib/auth'
import { checkRateLimit, getClientIP, normalizeEmailForRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    
    const ipRateLimit = checkRateLimit(ip, 'passwordResetSubmit', request)
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Muitas tentativas de redefinição de senha. Tente novamente em ${Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000 / 60)} minutos.`
        },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    const { token, password, confirmPassword } = body || {}
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 400 })
    }
    if (!password || !confirmPassword) {
      return NextResponse.json({ success: false, message: 'Informe a nova senha e a confirmação' }, { status: 400 })
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'As senhas não conferem' }, { status: 400 })
    }
    const strength = validatePasswordStrength(password)
    if (!strength.isValid) {
      return NextResponse.json({ success: false, message: strength.errors[0] || 'Senha inválida' }, { status: 400 })
    }
    const tokenRow = await getPasswordResetToken(token)
    if (!tokenRow) {
      return NextResponse.json({ success: false, message: 'Token inválido ou expirado' }, { status: 400 })
    }
    
    try {
      const user = await database.getUserById(tokenRow.user_id)
      if (user && user.email) {
        const normalizedEmail = normalizeEmailForRateLimit(user.email)
        const emailRateLimit = checkRateLimit(normalizedEmail, 'passwordResetSubmit', request)
        if (!emailRateLimit.allowed) {
          return NextResponse.json(
            {
              success: false,
              message: `Muitas tentativas para esta conta. Tente novamente em ${Math.ceil((emailRateLimit.resetTime - Date.now()) / 1000 / 60)} minutos.`
            },
            { status: 429 }
          )
        }
      }
    } catch (error) {
    }
    const userId = tokenRow.user_id
    const hashed = await hashPassword(password)
    await updateUserPassword(userId, hashed)
    await markPasswordResetTokenAsUsed(token)
    return NextResponse.json({ success: true, message: 'Senha redefinida com sucesso' })
  } catch (error) {

    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}