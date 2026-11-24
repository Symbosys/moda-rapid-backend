import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import { IStorageProvider, UploadOptions, UploadResult } from '../storage.interface';
import { logger } from '../../../common/utils/logger';

export interface S3Config {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucket?: string;
  customDomain?: string;
}

export class S3StorageProvider implements IStorageProvider {
  readonly providerName = 's3' as const;
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly customDomain?: string;

  constructor(config?: S3Config) {
    this.region = config?.region || process.env.AWS_REGION || 'ap-south-1';
    const accessKeyId = config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID || '';
    const secretAccessKey = config?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY || '';
    this.bucket = config?.bucket || process.env.AWS_S3_BUCKET || '';
    this.customDomain = config?.customDomain || process.env.AWS_S3_CUSTOM_DOMAIN;

    this.client = new S3Client({
      region: this.region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });
  }

  private buildFileKey(originalName: string, folder?: string, customFileName?: string): string {
    const cleanFolder = folder ? folder.replace(/^\/+|\/+$/g, '') : 'uploads';
    const extension = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '';
    const sanitizedName = customFileName
      ? customFileName
      : `${Date.now()}-${originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}${extension}`;

    return `${cleanFolder}/${sanitizedName}`;
  }

  private buildPublicUrl(key: string): string {
    if (this.customDomain) {
      const domain = this.customDomain.replace(/\/+$/, '');
      return `${domain}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const key = this.buildFileKey(originalName, options?.folder, options?.fileName);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: options?.contentType || mimeType,
      Metadata: options?.tags ? { tags: options.tags.join(',') } : undefined,
    });

    try {
      await this.client.send(command);

      return {
        url: this.buildPublicUrl(key),
        fileKey: key,
        provider: 's3',
        bytes: buffer.length,
      };
    } catch (error) {
      logger.error('[AWS S3] Upload failed:', error);
      throw error;
    }
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
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      logger.error(`[AWS S3] Failed to delete file with key ${fileKey}:`, error);
      return false;
    }
  }

  async getSignedUrl(fileKey: string, expiresInSeconds: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}
