import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';

export default fp(async (app) => {
  await app.register(jwt, {
    secret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
    sign: {
      expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
    },
  });

  app.addHook('onRequest', async (req) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const decoded = app.jwt.verify(token) as {
          id: string;
          email: string;
          role: string;
          name: string;
        };
        (req as typeof req & { user?: typeof decoded }).user = decoded;
      }
    } catch {
      // unauthenticated — not all routes require auth
    }
  });
});
