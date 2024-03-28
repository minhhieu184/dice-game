import { NODE_ENV } from './envSchema'

const envPath = {
  [NODE_ENV.development]: '.env.dev',
  [NODE_ENV.staging]: '.env.stg',
  [NODE_ENV.production]: '.env.prod'
}
export const getEnvPath = (nodeEnv: string | undefined) => {
  if (!nodeEnv) throw new Error('NODE_ENV is not defined')
  return envPath[nodeEnv]
}
