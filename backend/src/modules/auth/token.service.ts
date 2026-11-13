import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config/env.js';
import { JWTAccessPayload, JWTRefreshPayload } from './auth.types.js';
import { AppError } from '../../errors/AppError.js';

// In-memory revocation cache for revoked refresh tokens and blacklisted access tokens
// Automatically cleans up expired entries to prevent memory leaks
interface RevocationEntry {
  expiresAt: number;
}
const revokedTokens = new Map<string, RevocationEntry>();

// Periodic cleanup every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of revokedTokens.entries()) {
    if (val.expiresAt < now) {
      revokedTokens.delete(key);
    }
  }
}, 15 * 60 * 1000).unref();

export class TokenService {
  /**
   * Generates a short-lived JWT Access Token (15m)
   */
  static generateAccessToken(payload: JWTAccessPayload): string {
    const options: SignOptions = {
      expiresIn: (config.jwtAccessExpiresIn as any) || '15m',
      algorithm: 'HS256',
    };
    return jwt.sign(payload, config.jwtAccessSecret, options);
  }

  /**
   * Generates a long-lived JWT Refresh Token (7d) with unique tokenId for rotation tracking
   */
  static generateRefreshToken(userId: string, tokenVersion: number = 1): { token: string; tokenId: string } {
    const tokenId = crypto.randomUUID();
    const payload: JWTRefreshPayload = {
      userId,
      tokenId,
      tokenVersion,
    };
    const options: SignOptions = {
      expiresIn: (config.jwtRefreshExpiresIn as any) || '7d',
      algorithm: 'HS256',
    };
    const token = jwt.sign(payload, config.jwtRefreshSecret, options);
    return { token, tokenId };
  }

  /**
   * Verifies an access token
   */
  static verifyAccessToken(token: string): JWTAccessPayload {
    try {
      if (this.isRevoked(token)) {
        throw AppError.unauthorized('Token has been revoked', 'TOKEN_REVOKED');
      }
      return jwt.verify(token, config.jwtAccessSecret) as JWTAccessPayload;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Access token has expired', 'TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Invalid access token', 'TOKEN_INVALID');
    }
  }

  /**
   * Verifies a refresh token
   */
  static verifyRefreshToken(token: string): JWTRefreshPayload {
    try {
      if (this.isRevoked(token)) {
        throw AppError.unauthorized('Refresh token has been revoked', 'REFRESH_TOKEN_REVOKED');
      }
      const payload = jwt.verify(token, config.jwtRefreshSecret) as JWTRefreshPayload;
      if (this.isRevoked(payload.tokenId)) {
        throw AppError.unauthorized('Refresh token has been revoked', 'REFRESH_TOKEN_REVOKED');
      }
      return payload;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Refresh token has expired. Please log in again.', 'REFRESH_TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Invalid refresh token', 'REFRESH_TOKEN_INVALID');
    }
  }

  /**
   * Generates a signed password reset token (1 hour expiry)
   */
  static generatePasswordResetToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, purpose: 'PASSWORD_RESET' },
      config.jwtAccessSecret,
      { expiresIn: '1h', algorithm: 'HS256' }
    );
  }

  /**
   * Verifies a password reset token
   */
  static verifyPasswordResetToken(token: string): { userId: string; email: string } {
    try {
      if (this.isRevoked(token)) {
        throw AppError.badRequest('Password reset token has already been used', 'TOKEN_ALREADY_USED');
      }
      const decoded = jwt.verify(token, config.jwtAccessSecret) as any;
      if (decoded.purpose !== 'PASSWORD_RESET') {
        throw AppError.badRequest('Invalid token purpose', 'TOKEN_INVALID_PURPOSE');
      }
      return { userId: decoded.userId, email: decoded.email };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err.name === 'TokenExpiredError') {
        throw AppError.badRequest('Password reset token has expired. Please request a new one.', 'RESET_TOKEN_EXPIRED');
      }
      throw AppError.badRequest('Invalid password reset token', 'RESET_TOKEN_INVALID');
    }
  }

  /**
   * Revokes a token or tokenId with a specific TTL
   */
  static revoke(tokenOrId: string, ttlMs: number = 7 * 24 * 60 * 60 * 1000): void {
    if (!tokenOrId) return;
    revokedTokens.set(tokenOrId, {
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Checks whether a token or tokenId has been revoked
   */
  static isRevoked(tokenOrId: string): boolean {
    if (!tokenOrId) return true;
    const entry = revokedTokens.get(tokenOrId);
    if (!entry) return false;
    if (entry.expiresAt < Date.now()) {
      revokedTokens.delete(tokenOrId);
      return false;
    }
    return true;
  }
}

