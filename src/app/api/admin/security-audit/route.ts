import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, verifyAdminAccess } from '@/lib/auth';
import { runSecurityAudit } from '@/lib/security-audit';
import database from '@/lib/database';
import { applyAdminRateLimit } from '@/lib/admin-rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await applyAdminRateLimit(request, '/api/admin/security-audit');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Autenticação necessária.' },
        { status: 401 }
      );
    }
    
    const isAdmin = await verifyAdminAccess(user, database.query);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 403 }
      );
    }

    const auditReport = await runSecurityAudit();

    return NextResponse.json({
      success: true,
      report: auditReport
    });
  } catch (error) {

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno durante auditoria de segurança',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}