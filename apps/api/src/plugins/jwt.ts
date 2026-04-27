import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';

if (process.env['NODE_ENV'] === 'production' && !process.env['JWT_SECRET']) {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

export default fp(async (app) => {
  await app.register(jwt, {
    secret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
    sign: {
      expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
    },
  });

  app.decorateRequest('user', null);

  // Runs during onRequest lifecycle — AFTER @fastify/rate-limit (also onRequest,
  // registered earlier in app.ts) so every request is already rate-limited before
  // this hook executes. Protected routes still enforce auth via tRPC's
  // protectedProcedure; this hook only enriches the request context.
  app.addHook('onRequest', async (req) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const decoded = app.jwt.verify<{
          id: string;
          email: string;
          role: string;
          name: string;
        }>(token);
        (req as typeof req & { user?: typeof decoded }).user = decoded;
      }
    } catch {
      // unauthenticated — not all routes require a token
    }
  });
});
