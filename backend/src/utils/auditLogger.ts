import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';
import { logger } from './logger.js';
import { Request } from 'express';

export interface AuditLogParams {
  userId?: string | null;
  userName?: string;
  userRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  req?: Request;
}

/**
 * Creates an immutable audit log record compliant with Utah RPC 1.6 & Utah State Bar guidelines.
 * Audit log failures are logged to Winston without throwing to prevent breaking core user transactions.
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const ip = params.ipAddress || (params.req ? params.req.ip || params.req.socket.remoteAddress : null);
    const ua = params.userAgent || (params.req ? params.req.get('user-agent') : null);

    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userName: params.userName || 'SYSTEM',
        userRole: params.userRole || 'SYSTEM',
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId || null,
        details: (params.details as any) ?? Prisma.JsonNull,
        ipAddress: ip ? String(ip).slice(0, 50) : null,
        userAgent: ua ? String(ua).slice(0, 500) : null,
      },
    });

    logger.info(`Audit Log: [${params.action}] ${params.resourceType}${params.resourceId ? `:${params.resourceId}` : ''}`, {
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
    });
  } catch (err: unknown) {
    logger.error('Failed to create immutable audit log entry', {
      error: String(err),
      action: params.action,
      resourceType: params.resourceType,
    });
  }
}
