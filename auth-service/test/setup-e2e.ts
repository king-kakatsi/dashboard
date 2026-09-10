// Runs before any test file is loaded, so the Prisma client created at
// import time already sees a valid connection string.
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/dashboard_auth_e2e';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-test-secret';
process.env.ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-id';
process.env.GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || 'test-secret';
process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'test-id';
process.env.GITHUB_CLIENT_SECRET =
  process.env.GITHUB_CLIENT_SECRET || 'test-secret';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://frontend.test';
