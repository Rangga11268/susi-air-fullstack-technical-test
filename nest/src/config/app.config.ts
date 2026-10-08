export const APP_CONFIG = {
  today: process.env.APP_TODAY || '2026-05-15',
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'susi-air-pilot-operations-secret-2026',
  tokenExpiresInSeconds: 86400,
};
