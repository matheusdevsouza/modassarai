import { createHash } from 'crypto';
import { NextRequest } from 'next/server';
export function getUserIdentifier(request: NextRequest, userId?: number): string {
  if (userId) {
    return `user_${userId}`;
  }

  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  const hash = createHash('sha256')
    .update(`${ip}_${userAgent}`)
    .digest('hex')
    .substring(0, 32);
  
  return `anon_${hash}`;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',');
    return ips[0]?.trim() || 'unknown';
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}
  
export function getRequestInfo(request: NextRequest) {
  return {
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

