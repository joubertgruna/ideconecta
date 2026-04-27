import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

export default fp(async (app) => {
  await app.register(rateLimit, {
    max: Number(process.env['RATE_LIMIT_MAX'] ?? 100),
    timeWindow: Number(process.env['RATE_LIMIT_TIMEWINDOW'] ?? 60_000),
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas requisições. Tente novamente em breve.',
      },
      timestamp: new Date().toISOString(),
    }),
  });
});
