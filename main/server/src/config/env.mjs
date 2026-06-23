import dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';

/*
// --- User's Original Code ---
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3501'),
  MONGODB_URI: z.string().url('MONGODB_URI must be a valid URL'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters long'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 characters long'),
});

const _env = envSchema.safeParse(process.env);
// --- End User's Original Code ---
*/

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3501'),
  MONGODB_URI: z.string().url('MONGODB_URI must be a valid URL'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters long'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 characters long'),
  SMTP_HOST: z.string().optional(), // Using optional to prevent instant crash if user hasn't set it yet
  SMTP_PORT: z.string().regex(/^\d+$/).default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'), // Comma separated list
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
