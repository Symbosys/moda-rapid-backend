import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/v1'),
  APP_URL: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required in environment variables'),

  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_PASSWORD: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().default('modarapp_development_jwt_access_secret_key_2026_xyz'),
  JWT_REFRESH_SECRET: z.string().default('modarapp_development_jwt_refresh_secret_key_2026_xyz'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_secret_placeholder'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('whsec_placeholder'),

  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('120').transform(Number),

  // Storage
  STORAGE_PROVIDER: z.enum(['cloudinary', 's3', 'local']).default('cloudinary'),
  CLOUDINARY_CLOUD_NAME: z.string().default('wovajtme'),
  CLOUDINARY_API_KEY: z.string().default('851387641622515'),
  CLOUDINARY_API_SECRET: z.string().default('ajVQ4CFiRrFiqNUrdR4p9F_-Th4'),

  AWS_REGION: z.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_CUSTOM_DOMAIN: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
