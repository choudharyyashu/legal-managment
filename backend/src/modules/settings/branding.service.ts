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
   * Reads from firm_settings table in MySQL with fallback to Utah Law defaults.
   */
  static async getFirmBranding(): Promise<FirmBrandingConfig> {
    try {
      const setting = await prisma.firmSetting.findUnique({
        where: { id: 'default' },
        include: { updatedByUser: { select: { id: true, name: true } } },
      });

      if (setting) {
        return {
          firmName: setting.firmName,
          tagline: setting.tagline || '',
          primaryPhone: setting.primaryPhone || '',
          primaryEmail: setting.primaryEmail || '',
          address: setting.address || '',
          logoUrl: setting.logoUrl || null,
          primaryColor: setting.primaryColor,
          secondaryColor: setting.secondaryColor,
          accentColor: setting.accentColor,
          updatedAt: setting.updatedAt.toISOString(),
          updatedBy: setting.updatedByUser?.name || 'Administrator',
        };
      }
    } catch (err) {
      console.warn('Failed to query firm branding from firm_settings table, falling back to defaults:', err);
    }

    return DEFAULT_FIRM_BRANDING;
  }

  /**
   * Updates and persists firm branding settings in the firm_settings table.
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

    const firmName = input.firmName.trim();
    const tagline = (input.tagline || '').trim();
    const primaryPhone = (input.primaryPhone || '').trim();
    const primaryEmail = (input.primaryEmail || '').trim();
    const address = (input.address || '').trim();
    const logoUrl = input.logoUrl || null;
    const primaryColor = input.primaryColor || DEFAULT_FIRM_BRANDING.primaryColor;
    const secondaryColor = input.secondaryColor || DEFAULT_FIRM_BRANDING.secondaryColor;
    const accentColor = input.accentColor || DEFAULT_FIRM_BRANDING.accentColor;

    const saved = await prisma.firmSetting.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        firmName,
        tagline,
        primaryPhone,
        primaryEmail,
        address,
        logoUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        updatedByUserId: context.userId,
      },
      update: {
        firmName,
        tagline,
        primaryPhone,
        primaryEmail,
        address,
        logoUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        updatedByUserId: context.userId,
      },
      include: {
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    const updatedBranding: FirmBrandingConfig = {
      firmName: saved.firmName,
      tagline: saved.tagline || '',
      primaryPhone: saved.primaryPhone || '',
      primaryEmail: saved.primaryEmail || '',
      address: saved.address || '',
      logoUrl: saved.logoUrl || null,
      primaryColor: saved.primaryColor,
      secondaryColor: saved.secondaryColor,
      accentColor: saved.accentColor,
      updatedAt: saved.updatedAt.toISOString(),
      updatedBy: saved.updatedByUser?.name || userName || 'Administrator',
    };

    // Keep audit trail entry for compliance and security
    try {
      await prisma.auditLog.create({
        data: {
          userId: context.userId,
          userName: userName || 'Administrator',
          userRole: context.userRole,
          action: 'FIRM_BRANDING_UPDATED',
          resourceType: 'FIRM_BRANDING',
          resourceId: 'default',
          details: {
            branding: updatedBranding,
            updatedBy: updatedBranding.updatedBy,
            updatedAt: updatedBranding.updatedAt,
          } as any,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });
    } catch (auditErr) {
      console.warn('Failed to record firm branding audit log:', auditErr);
    }

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

    const saved = await prisma.firmSetting.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        firmName: DEFAULT_FIRM_BRANDING.firmName,
        tagline: DEFAULT_FIRM_BRANDING.tagline,
        primaryPhone: DEFAULT_FIRM_BRANDING.primaryPhone,
        primaryEmail: DEFAULT_FIRM_BRANDING.primaryEmail,
        address: DEFAULT_FIRM_BRANDING.address,
        logoUrl: null,
        primaryColor: DEFAULT_FIRM_BRANDING.primaryColor,
        secondaryColor: DEFAULT_FIRM_BRANDING.secondaryColor,
        accentColor: DEFAULT_FIRM_BRANDING.accentColor,
        updatedByUserId: context.userId,
      },
      update: {
        firmName: DEFAULT_FIRM_BRANDING.firmName,
        tagline: DEFAULT_FIRM_BRANDING.tagline,
        primaryPhone: DEFAULT_FIRM_BRANDING.primaryPhone,
        primaryEmail: DEFAULT_FIRM_BRANDING.primaryEmail,
        address: DEFAULT_FIRM_BRANDING.address,
        logoUrl: null,
        primaryColor: DEFAULT_FIRM_BRANDING.primaryColor,
        secondaryColor: DEFAULT_FIRM_BRANDING.secondaryColor,
        accentColor: DEFAULT_FIRM_BRANDING.accentColor,
        updatedByUserId: context.userId,
      },
      include: {
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    const resetBranding: FirmBrandingConfig = {
      firmName: saved.firmName,
      tagline: saved.tagline || '',
      primaryPhone: saved.primaryPhone || '',
      primaryEmail: saved.primaryEmail || '',
      address: saved.address || '',
      logoUrl: saved.logoUrl || null,
      primaryColor: saved.primaryColor,
      secondaryColor: saved.secondaryColor,
      accentColor: saved.accentColor,
      updatedAt: saved.updatedAt.toISOString(),
      updatedBy: saved.updatedByUser?.name || userName || 'Administrator',
    };

    try {
      await prisma.auditLog.create({
        data: {
          userId: context.userId,
          userName: userName || 'Administrator',
          userRole: context.userRole,
          action: 'FIRM_BRANDING_RESET',
          resourceType: 'FIRM_BRANDING',
          resourceId: 'default',
          details: {
            branding: resetBranding,
            resetBy: resetBranding.updatedBy,
            resetAt: resetBranding.updatedAt,
          } as any,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });
    } catch (auditErr) {
      console.warn('Failed to record firm branding reset audit log:', auditErr);
    }

    return resetBranding;
  }
}
