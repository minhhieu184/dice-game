import { z } from 'zod'

export enum NODE_ENV {
  development = 'development',
  staging = 'staging',
  production = 'production',
  test = 'test'
}

export const envSchema = z.object({
  NODE_ENV: z.nativeEnum(NODE_ENV).default(NODE_ENV.development),
  PORT: z.coerce.number().default(3300),
  DATABASE_URI: z.string().default('mongodb://localhost:27017'),
  DATABASE_INIT: z.string().default('dbName'),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.coerce.number(),
  REDIS_URI: z.string(),
  TABSAI_PRO_URL: z.string(),
  SIMPLE_SECRET: z.string(),
  ROOM_EXPIRE_MILLISECONDS: z.coerce.number()
})

export type Env = z.infer<typeof envSchema>
