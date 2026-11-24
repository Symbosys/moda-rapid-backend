import fs from 'fs';
import path from 'path';
import { IStorageProvider, UploadOptions, UploadResult } from '../storage.interface';
import { logger } from '../../../common/utils/logger';

export class LocalStorageProvider implements IStorageProvider {
  readonly providerName = 'local' as const;
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(uploadDir?: string, baseUrl?: string) {
    this.uploadDir = uploadDir || path.resolve(process.cwd(), 'uploads');
    this.baseUrl = baseUrl || process.env.APP_URL || 'http://localhost:3000';

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const folder = options?.folder || '';
    const targetDir = path.join(this.uploadDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const extension = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '';
    const fileName = options?.fileName || `${Date.now()}-${originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}${extension}`;
    const filePath = path.join(targetDir, fileName);

    await fs.promises.writeFile(filePath, buffer);

    const relativePath = path.join(folder, fileName).replace(/\\/g, '/');
    const url = `${this.baseUrl}/uploads/${relativePath}`;

    return {
      url,
      fileKey: relativePath,
      provider: 'local',
      bytes: buffer.length,
    };
  }

  async uploadFile(
    file: Express.Multer.File,
    options?: UploadOptions
  ): Promise<UploadResult> {
    if (file.buffer) {
      return this.uploadBuffer(file.buffer, file.originalname, file.mimetype, options);
    }

    if (file.path) {
      const buffer = await fs.promises.readFile(file.path);
      return this.uploadBuffer(buffer, file.originalname, file.mimetype, options);
    }

    throw new Error('Multer file has neither buffer nor path for upload');
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, fileKey);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`[Local Storage] Failed to delete file ${fileKey}:`, error);
      return false;
    }
  }
}
