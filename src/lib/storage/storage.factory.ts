import { IStorageProvider } from './storage.interface';
import { CloudinaryStorageProvider } from './providers/cloudinary.provider';
import { S3StorageProvider } from './providers/s3.provider';
import { LocalStorageProvider } from './providers/local.provider';
import { logger } from '../../common/utils/logger';

export type StorageProviderType = 'cloudinary' | 's3' | 'local';

export class StorageFactory {
  private static instance: IStorageProvider | null = null;
  private static activeType: StorageProviderType | null = null;

  /**
   * Returns a singleton storage provider based on configuration or override
   * @param providerOverride Optional provider type override ('cloudinary' | 's3' | 'local')
   */
  static getProvider(providerOverride?: StorageProviderType): IStorageProvider {
    const targetType: StorageProviderType =
      providerOverride ||
      (process.env.STORAGE_PROVIDER as StorageProviderType) ||
      'cloudinary';

    // Return cached instance if matching
    if (this.instance && this.activeType === targetType) {
      return this.instance;
    }

    logger.info(`[StorageFactory] Initializing storage provider: [${targetType.toUpperCase()}]`);

    switch (targetType) {
      case 's3':
        this.instance = new S3StorageProvider();
        break;
      case 'local':
        this.instance = new LocalStorageProvider();
        break;
      case 'cloudinary':
      default:
        this.instance = new CloudinaryStorageProvider();
        break;
    }

    this.activeType = targetType;
    return this.instance;
  }

  /**
   * Create an isolated instance of a specific provider
   */
  static create(type: StorageProviderType): IStorageProvider {
    switch (type) {
      case 's3':
        return new S3StorageProvider();
      case 'local':
        return new LocalStorageProvider();
      case 'cloudinary':
      default:
        return new CloudinaryStorageProvider();
    }
  }
}
