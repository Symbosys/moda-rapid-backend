import { IStorageProvider } from './storage.interface';
import { StorageFactory, StorageProviderType } from './storage.factory';

export * from './storage.interface';
export * from './storage.factory';
export * from './providers/cloudinary.provider';
export * from './providers/s3.provider';
export * from './providers/local.provider';

/**
 * Global default storage provider instance.
 *
 * To switch provider across the entire backend:
 * Option 1: Change `STORAGE_PROVIDER=s3` in .env
 * Option 2: Change the parameter below to 's3' or 'cloudinary':
 *           e.g. StorageFactory.getProvider('s3')
 */
export const storage: IStorageProvider = StorageFactory.getProvider();
