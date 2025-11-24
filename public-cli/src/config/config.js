import dotenv from 'dotenv';

dotenv.config();

export const loadConfig = () => {
  const config = {
    coreApiUrl: process.env.CORE_API_URL || 'http://localhost:3000',
    apiKey: process.env.API_KEY || '',
    ownerPhone: process.env.OWNER_PHONE || '',
    debug: process.env.DEBUG === 'true'
  };

  // Validate required fields
  if (!config.apiKey) {
    console.error('❌ API_KEY is required in .env file');
    process.exit(1);
  }

  if (!config.ownerPhone) {
    console.warn('⚠️  OWNER_PHONE not set in .env file');
  }

  return config;
};
