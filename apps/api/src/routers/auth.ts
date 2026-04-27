import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc/init.js';
import * as crypto from 'node:crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + process.env['JWT_SECRET']).digest('hex');
}

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
      cpf: z.string().optional(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'E-mail já cadastrado' });
      }

      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          passwordHash: hashPassword(input.password),
          name: input.name,
          cpf: input.cpf,
          phone: input.phone,
          role: 'USER',
        },
        select: { id: true, email: true, name: true, role: true },
      });

      const token = (ctx.req.server as { jwt: { sign: (payload: object) => string } }).jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      return { user, token };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (!user || user.passwordHash !== hashPassword(input.password)) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Credenciais inválidas' });
      }

      if (!user.isActive) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Conta desativada' });
      }

      const token = (ctx.req.server as { jwt: { sign: (payload: object) => string } }).jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      return {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { companies: true, reviews: true } },
      },
    });
    return user;
  }),
});
