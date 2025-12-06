import { NextRequest } from 'next/server';
import database from './database';

export type LogLevel = 'error' | 'warning' | 'info' | 'success' | 'debug';
export type LogContext = 
  | 'auth' 
  | 'order' 
  | 'product' 
  | 'user' 
  | 'security' 
  | 'admin' 
  | 'payment'
  | 'inventory'
  | 'system'
  | 'api'
  | 'file';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  userId?: number;
  userName?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  requestUrl?: string;
  requestMethod?: string;
  metadata?: Record<string, any>;
}

class SystemLogger {
  private async insertLog(entry: LogEntry): Promise<void> {
    try {
      const query = `
        INSERT INTO system_logs (
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      `;

      await database.query(query, [
        entry.level,
        entry.message,
        entry.context || null,
        entry.userId || null,
        entry.userName || null,
        entry.userEmail || null,
        entry.ip || null,
        entry.userAgent || null,
        entry.requestUrl || null,
        entry.requestMethod || null,
        entry.metadata ? JSON.stringify(entry.metadata) : null
      ]);
    } catch (error) {
      console.error('Erro ao inserir log no banco de dados:', error);
    }
  }

  private getClientIP(request?: NextRequest): string {
    if (!request) return '127.0.0.1';
    
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
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

  public async log(
    level: LogLevel,
    message: string,
    options: {
      context?: LogContext;
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    const entry: LogEntry = {
      level,
      message,
      context: options.context,
      userId: options.userId,
      userName: options.userName,
      userEmail: options.userEmail,
      ip: options.request ? this.getClientIP(options.request) : undefined,
      userAgent: options.request?.headers.get('user-agent') || undefined,
      requestUrl: options.request?.url || undefined,
      requestMethod: options.request?.method || undefined,
      metadata: options.metadata
    };

    await this.insertLog(entry);
  }

  public async logError(
    message: string,
    options: {
      context?: LogContext;
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
      error?: Error;
    } = {}
  ): Promise<void> {
    const metadata = {
      ...options.metadata,
      ...(options.error && {
        errorName: options.error.name,
        errorMessage: options.error.message,
        errorStack: options.error.stack
      })
    };

    await this.log('error', message, {
      ...options,
      metadata
    });
  }

  public async logWarning(
    message: string,
    options: {
      context?: LogContext;
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log('warning', message, options);
  }

  public async logInfo(
    message: string,
    options: {
      context?: LogContext;
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log('info', message, options);
  }

  public async logSuccess(
    message: string,
    options: {
      context?: LogContext;
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log('success', message, options);
  }

  public async logDebug(
    message: string,
    options: {
      context?: LogContext;
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log('debug', message, options);
  }

  public async logAuth(
    level: LogLevel,
    message: string,
    options: {
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log(level, message, {
      ...options,
      context: 'auth'
    });
  }

  public async logOrder(
    level: LogLevel,
    message: string,
    options: {
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log(level, message, {
      ...options,
      context: 'order'
    });
  }

  public async logProduct(
    level: LogLevel,
    message: string,
    options: {
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log(level, message, {
      ...options,
      context: 'product'
    });
  }

  public async logUser(
    level: LogLevel,
    message: string,
    options: {
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log(level, message, {
      ...options,
      context: 'user'
    });
  }

  public async logSecurity(
    level: LogLevel,
    message: string,
    options: {
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log(level, message, {
      ...options,
      context: 'security'
    });
  }

  public async logAdmin(
    level: LogLevel,
    message: string,
    options: {
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log(level, message, {
      ...options,
      context: 'admin'
    });
  }

  public async logPayment(
    level: LogLevel,
    message: string,
    options: {
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log(level, message, {
      ...options,
      context: 'payment'
    });
  }

  public async logSystem(
    level: LogLevel,
    message: string,
    options: {
      userId?: number;
      userName?: string;
      userEmail?: string;
      request?: NextRequest;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.log(level, message, {
      ...options,
      context: 'system'
    });
  }
}

export const systemLogger = new SystemLogger();










