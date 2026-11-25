import crypto from 'crypto';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { AppError } from '../../../errors/AppError.js';

export interface StoredFileMeta {
  storageKey: string;
  absolutePath: string;
  fileSizeBytes: number;
  sha256Checksum: string;
}

export interface StorageStats {
  rootPath: string;
  totalFiles: number;
  totalBytes: number;
  buckets: {
    vault: { files: number; bytes: number };
    drafts: { files: number; bytes: number };
    templates: { files: number; bytes: number };
    legacyVault: { files: number; bytes: number };
  };
}

/**
 * Unified Document Storage Service
 * Consolidates vault documents, generated drafts, and DOCX/PDF templates under storage/
 * while maintaining full backward compatibility with legacy vault/ paths.
 */
export class StorageService {
  static getStorageRoot(): string {
    return path.resolve(process.cwd(), 'storage');
  }

  static getLegacyVaultRoot(): string {
    return path.resolve(process.cwd(), 'vault');
  }

  /**
   * Normalizes and safely resolves a storage key to an absolute path,
   * preventing directory traversal outside storage/ or vault/.
   */
  static resolvePath(storageKey: string, legacyFallbackRelative?: string): string {
    if (!storageKey && !legacyFallbackRelative) {
      throw AppError.badRequest('Storage key is required.', 'INVALID_STORAGE_KEY');
    }

    const storageRoot = this.getStorageRoot();
    const legacyRoot = this.getLegacyVaultRoot();

    const candidates: string[] = [];
    if (storageKey) {
      if (path.isAbsolute(storageKey)) {
        candidates.push(path.resolve(storageKey));
      } else {
        const clean = storageKey.replace(/^[\\/]+/, '');
        const withoutStoragePrefix = clean.replace(/^storage[\\/]/, '');
        candidates.push(path.resolve(storageRoot, withoutStoragePrefix));
        candidates.push(path.resolve(process.cwd(), clean));
        if (clean.startsWith('vault/') || clean.startsWith('vault\\')) {
          candidates.push(path.resolve(legacyRoot, clean.replace(/^vault[\\/]/, '')));
          candidates.push(path.resolve(storageRoot, clean));
        }
      }
    }

    if (legacyFallbackRelative) {
      candidates.push(path.resolve(legacyRoot, legacyFallbackRelative));
      candidates.push(path.resolve(storageRoot, 'vault', legacyFallbackRelative));
    }

    for (const candidate of candidates) {
      if (fsSync.existsSync(candidate)) {
        return candidate;
      }
    }

    return candidates[0];
  }

  /**
   * Writes a buffer into storage/<relativeKey> and returns checksum & size metadata.
   */
  static async writeFile(relativeKey: string, buffer: Buffer): Promise<StoredFileMeta> {
    const cleanKey = relativeKey.replace(/^[\\/]+/, '').replace(/^storage[\\/]/, '').replace(/\\/g, '/');
    const storageRoot = this.getStorageRoot();
    const absolutePath = path.resolve(storageRoot, cleanKey);

    if (!absolutePath.startsWith(storageRoot)) {
      throw AppError.badRequest('Invalid storage path traversal detected.', 'INVALID_STORAGE_PATH');
    }

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    const sha256Checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      storageKey: cleanKey,
      absolutePath,
      fileSizeBytes: buffer.length,
      sha256Checksum,
    };
  }

  /**
   * Reads a file buffer from unified storage or legacy vault paths.
   */
  static async readFile(storageKey: string, legacyFallbackRelative?: string): Promise<Buffer> {
    const resolved = this.resolvePath(storageKey, legacyFallbackRelative);
    try {
      return await fs.readFile(resolved);
    } catch {
      throw AppError.notFound(
        `Stored file '${storageKey || legacyFallbackRelative}' could not be read from disk.`,
        'STORAGE_FILE_NOT_FOUND'
      );
    }
  }

  static exists(storageKey: string, legacyFallbackRelative?: string): boolean {
    try {
      const resolved = this.resolvePath(storageKey, legacyFallbackRelative);
      return fsSync.existsSync(resolved);
    } catch {
      return false;
    }
  }

  static async verifyIntegrity(
    storageKey: string,
    expectedSha256: string,
    legacyFallbackRelative?: string
  ): Promise<{ exists: boolean; verified: boolean; actualSha256: string | null; expectedSha256: string; fileSizeBytes: number }> {
    const resolved = this.resolvePath(storageKey, legacyFallbackRelative);
    if (!fsSync.existsSync(resolved)) {
      return {
        exists: false,
        verified: false,
        actualSha256: null,
        expectedSha256,
        fileSizeBytes: 0,
      };
    }

    const buffer = await fs.readFile(resolved);
    const actualSha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      exists: true,
      verified: actualSha256 === expectedSha256,
      actualSha256,
      expectedSha256,
      fileSizeBytes: buffer.length,
    };
  }

  private static async walkDirStats(dirPath: string): Promise<{ files: number; bytes: number }> {
    if (!fsSync.existsSync(dirPath)) {
      return { files: 0, bytes: 0 };
    }
    let files = 0;
    let bytes = 0;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const sub = await this.walkDirStats(fullPath);
        files += sub.files;
        bytes += sub.bytes;
      } else if (entry.isFile()) {
        const stat = await fs.stat(fullPath);
        files += 1;
        bytes += stat.size;
      }
    }
    return { files, bytes };
  }

  static async getStorageStats(): Promise<StorageStats> {
    const root = this.getStorageRoot();
    const legacyRoot = this.getLegacyVaultRoot();

    const [vault, drafts, templates, legacyVault] = await Promise.all([
      this.walkDirStats(path.join(root, 'vault')),
      this.walkDirStats(path.join(root, 'drafts')),
      this.walkDirStats(path.join(root, 'templates')),
      this.walkDirStats(legacyRoot),
    ]);

    return {
      rootPath: root,
      totalFiles: vault.files + drafts.files + templates.files + legacyVault.files,
      totalBytes: vault.bytes + drafts.bytes + templates.bytes + legacyVault.bytes,
      buckets: {
        vault,
        drafts,
        templates,
        legacyVault,
      },
    };
  }
}
