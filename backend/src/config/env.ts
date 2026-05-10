import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.string().default('3000'),
  HOST: z.string().default('localhost'),
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(10),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development")
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;