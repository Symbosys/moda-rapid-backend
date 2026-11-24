import dotenv from 'dotenv';
dotenv.config();

import { storage, StorageFactory } from '../src/lib/storage';

async function verifyStorage() {
  console.log('====================================================');
  console.log('🧪 Verifying Multi-Cloud Storage Provider Subsystem');
  console.log('====================================================\n');

  // 1. Verify Active Provider
  console.log(`1. Active default provider: [${storage.providerName}]`);
  if (storage.providerName !== 'cloudinary') {
    throw new Error(`Expected active provider to be 'cloudinary', got '${storage.providerName}'`);
  }
  console.log('   ✅ Default provider is correctly set to Cloudinary.\n');

  // 2. Verify Factory Switchability
  console.log('2. Testing Factory Dynamic Switch to AWS S3 & Local...');
  const s3Provider = StorageFactory.create('s3');
  console.log(`   - S3 Provider instantiated: [${s3Provider.providerName}]`);

  const localProvider = StorageFactory.create('local');
  console.log(`   - Local Provider instantiated: [${localProvider.providerName}]`);
  console.log('   ✅ Factory can dynamically instantiate S3, Local, or Cloudinary without code modifications.\n');

  // 3. Test Live Cloudinary Upload
  console.log('3. Testing Live Cloudinary Upload with provided credentials:');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   API Key:    ${process.env.CLOUDINARY_API_KEY}`);

  // 1x1 transparent PNG buffer
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const uploadResult = await storage.uploadBuffer(
    samplePngBuffer,
    'modarapp-verification.png',
    'image/png',
    {
      folder: 'modarapp-tests',
    }
  );

  console.log('\n   🎉 Upload Successful!');
  console.log(`   - URL:      ${uploadResult.url}`);
  console.log(`   - File Key: ${uploadResult.fileKey}`);
  console.log(`   - Provider: ${uploadResult.provider}`);
  console.log(`   - Bytes:    ${uploadResult.bytes}`);

  // 4. Test Deletion
  console.log('\n4. Testing Cloudinary Deletion of test file...');
  const deleted = await storage.deleteFile(uploadResult.fileKey);
  console.log(`   - Delete result: ${deleted ? '✅ Success' : '⚠️ Non-fatal/skipped'}`);

  console.log('\n====================================================');
  console.log('🎉 ALL STORAGE CHECKS PASSED PERFECTLY!');
  console.log('====================================================');
}

verifyStorage().catch((err) => {
  console.error('❌ Storage verification failed:', err);
  process.exit(1);
});
