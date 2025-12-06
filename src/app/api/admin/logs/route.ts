import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, verifyAdminAccess } from '@/lib/auth';
import database from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const search = searchParams.get('search') || '';
    const level = searchParams.get('level') || 'all';
    const context = searchParams.get('context') || 'all';
    const dateFilter = searchParams.get('date') || 'all';

    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    const params: any[] = [];

    if (level !== 'all') {
      whereConditions.push('level = $' + (params.length + 1));
      params.push(level);
    }

    if (context !== 'all') {
      whereConditions.push('context = $' + (params.length + 1));
      params.push(context);
    }

    if (dateFilter !== 'all') {
      const dateConditions: Record<string, string> = {
        today: "created_at >= CURRENT_DATE",
        week: "created_at >= CURRENT_DATE - INTERVAL '7 days'",
        month: "created_at >= CURRENT_DATE - INTERVAL '30 days'"
      };
      
      if (dateConditions[dateFilter]) {
        whereConditions.push(dateConditions[dateFilter]);
      }
    }

    if (search) {
      whereConditions.push(
        `(
          message ILIKE $${params.length + 1} OR
          context ILIKE $${params.length + 1} OR
          user_name ILIKE $${params.length + 1} OR
          user_email ILIKE $${params.length + 1}
        )`
      );
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const query = `
      SELECT 
        id,
        level,
        message,
        context,
        user_id,
        user_name,
        user_email,
        ip_address,
        user_agent,
        request_url,
        request_method,
        metadata,
        created_at
      FROM system_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const logs = await database.query(query, params);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM system_logs
      ${whereClause}
    `;
    const countParams = params.slice(0, -2);
    const countResult = await database.query(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0');

    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE level = 'error') as error,
        COUNT(*) FILTER (WHERE level = 'warning') as warning,
        COUNT(*) FILTER (WHERE level = 'info') as info,
        COUNT(*) FILTER (WHERE level = 'success') as success,
        COUNT(*) FILTER (WHERE level = 'debug') as debug
      FROM system_logs
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.filter((_, idx) => !search || idx < whereConditions.length - 1).join(' AND ') : ''}
    `;
    const statsParams = search ? params.slice(0, -4) : params.slice(0, -2);
    const statsResult = await database.query(statsQuery, statsParams.length > 0 ? statsParams : []);

    const processedLogs = logs.map((log: any) => ({
      id: log.id.toString(),
      level: log.level,
      message: log.message,
      context: log.context || null,
      userId: log.user_id?.toString() || null,
      userName: log.user_name || null,
      userEmail: log.user_email || null,
      ip: log.ip_address || null,
      userAgent: log.user_agent || null,
      createdAt: log.created_at,
      metadata: log.metadata ? (typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata) : null
    }));

    return NextResponse.json({
      success: true,
      data: {
        logs: processedLogs,
        stats: {
          total: parseInt(statsResult[0]?.total || '0'),
          error: parseInt(statsResult[0]?.error || '0'),
          warning: parseInt(statsResult[0]?.warning || '0'),
          info: parseInt(statsResult[0]?.info || '0'),
          success: parseInt(statsResult[0]?.success || '0'),
          debug: parseInt(statsResult[0]?.debug || '0')
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar logs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        data: {
          logs: [],
          stats: {
            total: 0,
            error: 0,
            warning: 0,
            info: 0,
            success: 0,
            debug: 0
          },
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            pages: 0
          }
        }
      },
      { status: 500 }
    );
  }
}










