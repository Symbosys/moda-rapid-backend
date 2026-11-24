export interface UploadOptions {
  folder?: string;
  fileName?: string;
  contentType?: string;
  tags?: string[];
  transformation?: Record<string, unknown>;
}

export interface UploadResult {
  url: string;
  fileKey: string;
  provider: 'cloudinary' | 's3' | 'local';
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export interface IStorageProvider {
  readonly providerName: 'cloudinary' | 's3' | 'local';

  uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<UploadResult>;

  uploadFile(
    file: Express.Multer.File,
    options?: UploadOptions
  ): Promise<UploadResult>;

  deleteFile(fileKey: string): Promise<boolean>;

  getSignedUrl?(fileKey: string, expiresInSeconds?: number): Promise<string>;
}
