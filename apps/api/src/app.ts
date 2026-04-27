import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import fp from 'fastify-plugin';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from './trpc/router.js';
import { createContext } from './trpc/context.js';
import { prisma } from './db/prisma.js';
import Redis from 'ioredis';

let redis: Redis;

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
    },
  });

  redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
  });

  try {
    await redis.connect();
    app.log.info('Redis connected');
  } catch {
    app.log.warn('Redis unavailable, continuing without cache');
  }

  // Plugins — order matters: rate limiting must be registered before JWT so
  // the rate-limit onRequest hook runs before the JWT onRequest hook.
  await app.register(helmet, { global: true });
  await app.register(fp(async (fastify) => {
    const { default: corsPlugin } = await import('./plugins/cors.js');
    await fastify.register(corsPlugin);
  }));
  await app.register(fp(async (fastify) => {
    const { default: rateLimitPlugin } = await import('./plugins/rateLimit.js');
    await fastify.register(rateLimitPlugin);
  }));
  await app.register(fp(async (fastify) => {
    const { default: jwtPlugin } = await import('./plugins/jwt.js');
    await fastify.register(jwtPlugin);
  }));

  // tRPC
  await app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext: (opts: { req: Parameters<typeof createContext>[0]['req']; res: Parameters<typeof createContext>[0]['res'] }) =>
        createContext({ ...opts, db: prisma, redis }),
    },
  });

  // Health check — rate-limited to prevent DB flood
  app.get(
    '/health',
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '1 minute',
        },
      },
    },
    async () => ({
      status: 'ok',
      version: process.env['npm_package_version'] ?? '0.1.0',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        redis: redis.status === 'ready' ? 'ok' : 'error',
        ai: 'ok',
      },
    })
  );

  app.setErrorHandler((error, _req, reply) => {
    app.log.error(error);
    return reply.code(error.statusCode ?? 500).send({
      success: false,
      error: {
        code: error.code ?? 'INTERNAL_SERVER_ERROR',
        message:
          process.env['NODE_ENV'] === 'production'
            ? 'Erro interno do servidor'
            : error.message,
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.addHook('onClose', async () => {
    try {
      await redis.quit();
    } catch {
      // ignore disconnect errors during shutdown
    }
  });

  return app;
}
