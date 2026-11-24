import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { IStorageProvider, UploadOptions, UploadResult } from '../storage.interface';
import { logger } from '../../../common/utils/logger';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export class CloudinaryStorageProvider implements IStorageProvider {
  readonly providerName = 'cloudinary' as const;

  constructor(config?: CloudinaryConfig) {
    const cloudName = config?.cloudName || process.env.CLOUDINARY_CLOUD_NAME || '';
    const apiKey = config?.apiKey || process.env.CLOUDINARY_API_KEY || '';
    const apiSecret = config?.apiSecret || process.env.CLOUDINARY_API_SECRET || '';

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const folder = options?.folder || 'modarapp';
    const publicId = options?.fileName
      ? options.fileName.replace(/\.[^/.]+$/, '')
      : `${Date.now()}-${originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'auto',
          tags: options?.tags,
          ...options?.transformation,
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            logger.error('[Cloudinary] Buffer upload failed:', error);
            return reject(new Error(error?.message || 'Cloudinary upload failed'));
          }

          resolve({
            url: result.secure_url,
            fileKey: result.public_id,
            provider: 'cloudinary',
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    options?: UploadOptions
  ): Promise<UploadResult> {
    if (file.buffer) {
      return this.uploadBuffer(file.buffer, file.originalname, file.mimetype, options);
    }

    if (file.path) {
      const folder = options?.folder || 'modarapp';
      const publicId = options?.fileName
        ? options.fileName.replace(/\.[^/.]+$/, '')
        : `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}`;

      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        public_id: publicId,
        resource_type: 'auto',
        tags: options?.tags,
        ...options?.transformation,
      });

      return {
        url: result.secure_url,
        fileKey: result.public_id,
        provider: 'cloudinary',
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      };
    }

    throw new Error('Multer file has neither buffer nor path for upload');
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const res = await cloudinary.uploader.destroy(fileKey);
      return res.result === 'ok';
    } catch (error) {
      logger.error(`[Cloudinary] Failed to delete file with key ${fileKey}:`, error);
      return false;
    }
  }
}
