import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Enterprise password hashing and verification service using bcrypt with 12 salt rounds.
 */
export class PasswordService {
  /**
   * Hashes a plain-text password securely.
   */
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compares a plain-text password with a bcrypt hash.
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) return false;
    return bcrypt.compare(password, hash);
  }

  /**
   * Validates password strength policy:
   * - Minimum 8 characters
   * - At least 1 uppercase letter
   * - At least 1 lowercase letter
   * - At least 1 numeric digit
   * - At least 1 special character
   */
  static validateStrength(password: string): { valid: boolean; reason?: string } {
    if (!password || password.length < 8) {
      return { valid: false, reason: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one numeric digit.' };
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one special character.' };
    }
    return { valid: true };
  }
}

