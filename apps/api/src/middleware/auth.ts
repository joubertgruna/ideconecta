import type { FastifyRequest, FastifyReply } from 'fastify';

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = (req as FastifyRequest & { user?: { id: string } }).user;
  if (!user) {
    return reply.code(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Autenticação necessária' },
      timestamp: new Date().toISOString(),
    });
  }
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = (req as FastifyRequest & { user?: { id: string; role: string } }).user;
  if (!user || user.role !== 'ADMIN') {
    return reply.code(403).send({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Acesso restrito a administradores' },
      timestamp: new Date().toISOString(),
    });
  }
}
