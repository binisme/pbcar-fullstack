import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT) || 4000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || 'ebike-c0a0b',
};

export const PACKAGES = {
  15: { minutes: 15, price: 50000, testSeconds: 5 },
  30: { minutes: 30, price: 80000, testSeconds: 10 },
};
