import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from './rate-limit';
import { authenticateUser, verifyAdminAccess } from './auth';
import database from './database';
  export function getAdminRateLimitType(pathname: string): 'adminGeneral' | 'adminSensitive' | 'adminDataExport' | 'adminSecurityAudit' | 'adminRevealData' {
  if (pathname.includes('/reveal-data') || pathname.includes('/expose')) {
    return 'adminRevealData';
  }
  
  if (pathname.includes('/security-audit') || pathname.includes('/audit')) {
    return 'adminSecurityAudit';
  }
  
  if (pathname.includes('/export') || pathname.includes('/download') || pathname.includes('/backup')) {
    return 'adminDataExport';
  }
  
  if (
    pathname.includes('/users') ||
    pathname.includes('/orders') ||
    pathname.includes('/products') ||
    pathname.includes('/categories') ||
    pathname.includes('/dashboard')
  ) {
    return 'adminSensitive';
  }
  
  return 'adminGeneral';
}

export async function applyAdminRateLimit(
  request: NextRequest,
  pathname?: string
): Promise<NextResponse | null> {
  const ip = getClientIP(request);
  const actualPathname = pathname || request.nextUrl.pathname;
  const rateLimitType = getAdminRateLimitType(actualPathname);
  
  const rateLimit = checkRateLimit(ip, rateLimitType, request);
  
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit excedido',
        message: `Muitas requisições. Tente novamente em ${minutes} minutos.`,
        resetTime: rateLimit.resetTime,
        blocked: rateLimit.blocked
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': rateLimitType,
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetTime.toString()
        }
      }
    );
  }
  
  return null;
}

export async function adminMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const rateLimitResponse = await applyAdminRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso negado. Autenticação necessária.'
      },
      { status: 401 }
    );
  }
  
  const isAdmin = await verifyAdminAccess(user, database.query);
  if (!isAdmin) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso negado. Apenas administradores autorizados.'
      },
      { status: 403 }
    );
  }
  
  return null;
}

