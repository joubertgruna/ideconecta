import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';

export default fp(async (app) => {
  await app.register(jwt, {
    secret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
    sign: {
      expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
    },
  });

  // Attach decoded user to request when Authorization header is present.
  // This does NOT enforce auth on all routes — protected routes use the
  // protectedProcedure middleware in tRPC which checks ctx.user.
  app.decorateRequest('user', null);
  app.addHook('preHandler', async (req) => {
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
      // unauthenticated — not all routes require auth
    }
  });
});
