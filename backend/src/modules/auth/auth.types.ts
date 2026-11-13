import { Request } from 'express';

export interface JWTAccessPayload {
  userId: string;
  userCode: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface JWTRefreshPayload {
  userId: string;
  tokenId: string;
  tokenVersion: number;
}

export interface SafeUser {
  id: string;
  userCode: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  title: string | null;
  initials: string;
  department: string | null;
  billingRate: number | string;
  status: string;
  mfaEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  permissions?: string[];
}

export interface LoginResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  permissions: string[];
}

export interface AuthenticatedUser {
  id: string;
  userCode: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

