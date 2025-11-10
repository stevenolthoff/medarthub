import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  emailFrom: string;
  inviteOnlySignup: boolean;
  webBaseUrl: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '1h') as string,
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT) || 2525,
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@localhost',
  inviteOnlySignup: process.env.INVITE_ONLY_SIGNUP === 'true',
  webBaseUrl: process.env.WEB_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
};

if (config.inviteOnlySignup && (!config.smtpHost || !config.smtpUser || !config.smtpPassword)) {
  console.warn('⚠️ WARNING: INVITE_ONLY_SIGNUP is true, but SMTP is not configured. Invites cannot be sent.');
}

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
