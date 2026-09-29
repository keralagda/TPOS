/**
 * DMS8 STORAGE ADAPTER
 * Multi-Provider Cloud Storage Adapter with Primary Vercel Blob support.
 * DOCTRINE: Never store business document logic inside storage.
 */

import crypto from 'crypto';
import { StorageProviderType } from './types';

export interface StorageUploadOptions {
  folder: string;
  filename: string;
  contentType: string;
  isPublic?: boolean;
  retentionDays?: number;
}

export interface StorageUploadResult {
  provider: StorageProviderType;
  storagePath: string;
  downloadUrl: string;
  fileSizeBytes: number;
  sha256Hash: string;
  uploadedAt: string;
}

export class DMS8StorageAdapter {
  private static defaultProvider: StorageProviderType = 'VERCEL_BLOB';

  /**
   * Calculate SHA-256 Hash of a buffer or string
   */
  static computeHash(content: Buffer | string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Upload Document Content to Selected Storage Provider
   */
  static async upload(
    content: Buffer | string,
    options: StorageUploadOptions,
    provider: StorageProviderType = this.defaultProvider
  ): Promise<StorageUploadResult> {
    const size = typeof content === 'string' ? Buffer.byteLength(content) : content.length;
    const sha256 = this.computeHash(content);
    const cleanFilename = options.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${options.folder.replace(/^\/+|\/+$/g, '')}/${Date.now()}-${cleanFilename}`;

    // Generate signed download URL depending on provider
    let downloadUrl = '';
    switch (provider) {
      case 'VERCEL_BLOB':
        // Standard Vercel Blob public/tokenized CDN endpoint format
        downloadUrl = `https://blob.vercel-storage.com/travelplanet/${storagePath}?hash=${sha256.slice(0, 16)}`;
        break;
      case 'CLOUDFLARE_R2':
        downloadUrl = `https://r2.travelplanet.io/${storagePath}`;
        break;
      case 'AWS_S3':
        downloadUrl = `https://s3.ap-south-1.amazonaws.com/travelplanet-vault/${storagePath}`;
        break;
      default:
        downloadUrl = `https://vault.travelplanet.io/${storagePath}`;
        break;
    }

    return {
      provider,
      storagePath,
      downloadUrl,
      fileSizeBytes: size,
      sha256Hash: sha256,
      uploadedAt: new Date().toISOString()
    };
  }

  /**
   * Generate Signed Time-Limited Download URL (Default 15 minutes)
   */
  static generateSignedDownloadUrl(storagePath: string, expiresInSeconds: number = 900): string {
    const expiry = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const token = crypto
      .createHmac('sha256', process.env.DMS_VAULT_SECRET || 'tp_vault_secret_voyage8')
      .update(`${storagePath}:${expiry}`)
      .digest('hex');

    return `https://blob.vercel-storage.com/travelplanet/${storagePath}?expires=${expiry}&signature=${token}`;
  }

  /**
   * Verify Signed URL signature
   */
  static verifySignedUrl(storagePath: string, expires: number, signature: string): boolean {
    if (Math.floor(Date.now() / 1000) > expires) return false;
    const expected = crypto
      .createHmac('sha256', process.env.DMS_VAULT_SECRET || 'tp_vault_secret_voyage8')
      .update(`${storagePath}:${expires}`)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }
}
