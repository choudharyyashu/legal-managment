export interface FirmBrandingConfig {
  firmName: string;
  tagline: string;
  primaryPhone: string;
  primaryEmail: string;
  address: string;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface UpdateBrandingContext {
  userId: string;
  userName?: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
}
