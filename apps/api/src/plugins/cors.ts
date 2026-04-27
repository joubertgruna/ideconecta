import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export default fp(async (app) => {
  const origins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:5173').split(',');

  await app.register(cors, {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
});
