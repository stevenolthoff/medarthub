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
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://app:app_pw@localhost:5432/app_db',
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey', // Fallback for dev, but strongly warn
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '1h') as string,
};

// Basic validation for critical config
if (!config.jwtSecret || config.jwtSecret === 'supersecretjwtkey') {
  console.warn('⚠️ WARNING: JWT_SECRET is not set or using default. Please set a strong secret in your .env file!');
}

export default config;
