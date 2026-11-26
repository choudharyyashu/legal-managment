import { prisma } from '../../config/database.js';
import { FirmBrandingConfig, UpdateBrandingContext } from './branding.types.js';
import { UpdateFirmBrandingInput } from './branding.validation.js';

export const DEFAULT_FIRM_BRANDING: FirmBrandingConfig = {
  firmName: 'HEUGLY & BLUDWORTH, LLC',
  tagline: 'ATTORNEYS AT LAW • ESTABLISHED PRACTICE',
  primaryPhone: '(801) 555-0100',
  primaryEmail: 'contact@utahslawyers.com',
  address: '250 State Street, Suite 800, Salt Lake City, UT 84111',
  logoUrl: null,
  primaryColor: '#06244B',
  secondaryColor: '#F5F0E5',
  accentColor: '#A4432B',
  updatedAt: null,
  updatedBy: null,
};

export class BrandingService {
  /**
   * Retrieves active firm branding settings.
   * Reads from audit_logs table (persisted across restarts and refreshes).
   * Falls back to Utah Law firm defaults if no customization is saved yet.
   */
  static async getFirmBranding(): Promise<FirmBrandingConfig> {
    try {
      const latestLog = await prisma.auditLog.findFirst({
        where: {
          resourceType: 'FIRM_BRANDING',
          action: { in: ['FIRM_BRANDING_UPDATED', 'FIRM_BRANDING_RESET'] },
        },
        orderBy: { timestamp: 'desc' },
      });

      if (latestLog && latestLog.details && (latestLog.details as any).branding) {
        const saved = (latestLog.details as any).branding;
        return {
          ...DEFAULT_FIRM_BRANDING,
          ...saved,
          updatedAt: latestLog.timestamp.toISOString(),
          updatedBy: latestLog.userName || (latestLog.details as any).updatedBy || 'System Administrator',
        };
      }
    } catch (err) {
      console.warn('Failed to query firm branding from audit log, falling back to defaults:', err);
    }

    return DEFAULT_FIRM_BRANDING;
  }

  /**
   * Updates and persists firm branding settings in the audit_logs table.
   */
  static async updateFirmBranding(
    input: UpdateFirmBrandingInput,
    context: UpdateBrandingContext
  ): Promise<FirmBrandingConfig> {
    // Resolve user name if needed
    let userName = context.userName;
    if (!userName || userName === 'SYSTEM') {
      const user = await prisma.user.findUnique({
        where: { id: context.userId },
        select: { name: true },
      });
      if (user?.name) userName = user.name;
    }

    const updatedBranding: FirmBrandingConfig = {
      firmName: input.firmName.trim(),
      tagline: (input.tagline || '').trim(),
      primaryPhone: (input.primaryPhone || '').trim(),
      primaryEmail: (input.primaryEmail || '').trim(),
      address: (input.address || '').trim(),
      logoUrl: input.logoUrl || null,
      primaryColor: input.primaryColor || DEFAULT_FIRM_BRANDING.primaryColor,
      secondaryColor: input.secondaryColor || DEFAULT_FIRM_BRANDING.secondaryColor,
      accentColor: input.accentColor || DEFAULT_FIRM_BRANDING.accentColor,
      updatedAt: new Date().toISOString(),
      updatedBy: userName || 'Administrator',
    };

    await prisma.auditLog.create({
      data: {
        userId: context.userId,
        userName: userName || 'Administrator',
        userRole: context.userRole,
        action: 'FIRM_BRANDING_UPDATED',
        resourceType: 'FIRM_BRANDING',
        resourceId: 'firm-branding-main',
        details: {
          branding: updatedBranding,
          updatedBy: userName || 'Administrator',
          updatedAt: updatedBranding.updatedAt,
        } as any,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });

    return updatedBranding;
  }

  /**
   * Resets firm branding settings back to official Utah Law defaults.
   */
  static async resetFirmBranding(context: UpdateBrandingContext): Promise<FirmBrandingConfig> {
    let userName = context.userName;
    if (!userName || userName === 'SYSTEM') {
      const user = await prisma.user.findUnique({
        where: { id: context.userId },
        select: { name: true },
      });
      if (user?.name) userName = user.name;
    }

    const resetBranding: FirmBrandingConfig = {
      ...DEFAULT_FIRM_BRANDING,
      updatedAt: new Date().toISOString(),
      updatedBy: userName || 'Administrator',
    };

    await prisma.auditLog.create({
      data: {
        userId: context.userId,
        userName: userName || 'Administrator',
        userRole: context.userRole,
        action: 'FIRM_BRANDING_RESET',
        resourceType: 'FIRM_BRANDING',
        resourceId: 'firm-branding-main',
        details: {
          branding: resetBranding,
          resetBy: userName || 'Administrator',
          resetAt: resetBranding.updatedAt,
        } as any,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });

    return resetBranding;
  }
}
