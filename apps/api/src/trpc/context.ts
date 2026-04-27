import type { FastifyRequest, FastifyReply } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import type { Redis } from 'ioredis';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface Context {
  req: FastifyRequest;
  res: FastifyReply;
  db: PrismaClient;
  redis: Redis;
  user: AuthUser | null;
}

export interface CreateContextOptions {
  req: FastifyRequest;
  res: FastifyReply;
  db: PrismaClient;
  redis: Redis;
}

export async function createContext({ req, res, db, redis }: CreateContextOptions): Promise<Context> {
  let user: AuthUser | null = null;

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      // JWT verification happens in Fastify plugin, exposed via req.user
      user = (req as FastifyRequest & { user?: AuthUser }).user ?? null;
    }
  } catch {
    // unauthenticated request
  }

  return { req, res, db, redis, user };
}
