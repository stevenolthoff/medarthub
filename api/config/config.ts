import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '1h') as string,
};

if (!config.jwtSecret) {
  const errorMessage = 'FATAL ERROR: JWT_SECRET is not set. Please provide a strong secret in your .env file.';
  console.error(`❌ ${errorMessage}`);
  throw new Error(errorMessage);
}

if (config.nodeEnv === 'production' && config.jwtSecret.length < 32) {
  const errorMessage = 'FATAL ERROR: JWT_SECRET must be at least 32 characters long in production.';
  console.error(`❌ ${errorMessage}`);
  throw new Error(errorMessage);
}

if (!config.databaseUrl) {
  const errorMessage = 'FATAL ERROR: DATABASE_URL is not set. Please set it in your .env file.';
  console.error(`❌ ${errorMessage}`);
  throw new Error(errorMessage);
}

export default config;
