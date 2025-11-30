import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import database from './database';

const CODE_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 10;
const MAX_VERIFICATION_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60;
const MAX_REQUESTS_PER_HOUR = 5;

export function generateSecureCode(): string {
  const randomNum = randomBytes(3).readUIntBE(0, 3);
  const code = (100000 + (randomNum % 900000)).toString();
  return code;
}

export function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export function verifyCode(inputCode: string, hashedCode: string): boolean {
  const inputHash = hashCode(inputCode);
  
  if (inputHash.length !== hashedCode.length) {
    return false;
  }
  
  try {
    return timingSafeEqual(
      Buffer.from(inputHash, 'hex'),
      Buffer.from(hashedCode, 'hex')
    );
  } catch {
    return false;
  }
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export async function checkRateLimit(
  identifier: string,
  identifierType: 'email' | 'ip'
): Promise<{ allowed: boolean; retryAfter: number }> {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const rateLimitRecords = await database.query(
      `SELECT * FROM two_factor_rate_limits 
       WHERE identifier = $1 AND identifier_type = $2`,
      [identifier, identifierType]
    );
    
    if (rateLimitRecords.length > 0) {
      const record = rateLimitRecords[0];
      const lastRequest = new Date(record.last_request_at);
      
      const cooldownEnd = new Date(lastRequest.getTime() + COOLDOWN_SECONDS * 1000);
      if (now < cooldownEnd) {
        const retryAfter = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
        return { allowed: false, retryAfter };
      }
      
      if (lastRequest > oneHourAgo) {
        if (record.request_count >= MAX_REQUESTS_PER_HOUR) {
          const retryAfter = Math.ceil((lastRequest.getTime() + 60 * 60 * 1000 - now.getTime()) / 1000);
          return { allowed: false, retryAfter };
        }
        
        await database.query(
          `UPDATE two_factor_rate_limits 
           SET request_count = request_count + 1, last_request_at = $1
           WHERE id = $2`,
          [now, record.id]
        );
      } else {
        await database.query(
          `UPDATE two_factor_rate_limits 
           SET request_count = 1, last_request_at = $1
           WHERE id = $2`,
          [now, record.id]
        );
      }
    } else {
      await database.query(
        `INSERT INTO two_factor_rate_limits (identifier, identifier_type, last_request_at, request_count)
         VALUES ($1, $2, $3, 1)`,
        [identifier, identifierType, now]
      );
    }
    
    return { allowed: true, retryAfter: 0 };
  } catch (error) {
    console.error('Erro ao verificar rate limit:', error);
    return { allowed: true, retryAfter: 0 };
  }
}

export async function create2FACode(
  userId: number,
  email: string,
  sessionToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ code: string; expiresAt: Date }> {
  await database.query(
    `UPDATE two_factor_codes 
     SET is_used = TRUE 
     WHERE user_id = $1 AND is_used = FALSE`,
    [userId]
  );
  
  const code = generateSecureCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
  
  await database.query(
    `INSERT INTO two_factor_codes 
     (user_id, email, code_hash, expires_at, session_token, ip_address, user_agent, max_attempts)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, email, codeHash, expiresAt, sessionToken, ipAddress || null, userAgent || null, MAX_VERIFICATION_ATTEMPTS]
  );
  
  return { code, expiresAt };
}

export async function verify2FACode(
  sessionToken: string,
  inputCode: string,
  userId: number,
  email: string
): Promise<{ 
  valid: boolean; 
  error?: string;
  codeRecord?: any;
}> {
  try {
    const codes = await database.query(
      `SELECT * FROM two_factor_codes 
       WHERE session_token = $1 
         AND user_id = $2 
         AND email = $3
         AND is_used = FALSE
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [sessionToken, userId, email]
    );
    
    if (!codes || codes.length === 0) {
      return {
        valid: false,
        error: 'Código inválido ou expirado. Solicite um novo código.'
      };
    }
    
    const codeRecord = codes[0];
    
    if (codeRecord.attempts >= codeRecord.max_attempts) {
      await database.query(
        `UPDATE two_factor_codes SET is_used = TRUE WHERE id = $1`,
        [codeRecord.id]
      );
      return {
        valid: false,
        error: 'Muitas tentativas falhadas. Solicite um novo código.'
      };
    }
    
    const isValid = verifyCode(inputCode, codeRecord.code_hash);
    
    if (!isValid) {
      await database.query(
        `UPDATE two_factor_codes 
         SET attempts = attempts + 1 
         WHERE id = $1`,
        [codeRecord.id]
      );
      
      const remainingAttempts = codeRecord.max_attempts - (codeRecord.attempts + 1);
      
      return {
        valid: false,
        error: remainingAttempts > 0
          ? `Código incorreto. ${remainingAttempts} tentativa(s) restante(s).`
          : 'Muitas tentativas falhadas. Solicite um novo código.'
      };
    }
    
    await database.query(
      `UPDATE two_factor_codes 
       SET is_used = TRUE, verified_at = NOW() 
       WHERE id = $1`,
      [codeRecord.id]
    );
    
    await database.query(
      `UPDATE two_factor_codes 
       SET is_used = TRUE 
       WHERE user_id = $1 AND session_token != $2 AND is_used = FALSE`,
      [userId, sessionToken]
    );
    
    return {
      valid: true,
      codeRecord
    };
  } catch (error) {
    console.error('Erro ao verificar código 2FA:', error);
    return {
      valid: false,
      error: 'Erro interno ao verificar código. Tente novamente.'
    };
  }
}

export async function cleanupExpiredCodes(): Promise<void> {
  try {
    await database.query(
      `DELETE FROM two_factor_codes 
       WHERE expires_at < NOW() - INTERVAL '1 day'`
    );
    
    await database.query(
      `DELETE FROM two_factor_rate_limits 
       WHERE last_request_at < NOW() - INTERVAL '24 hours'`
    );
  } catch (error) {
    console.error('Erro ao limpar códigos expirados:', error);
  }
}

export function getClientIP(request: any): string {
  const forwarded = request.headers?.get('x-forwarded-for');
  const realIP = request.headers?.get('x-real-ip');
  const cfConnectingIP = request.headers?.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  return '127.0.0.1';
}

export function getUserAgent(request: any): string {
  return request.headers?.get('user-agent') || 'Unknown';
}

