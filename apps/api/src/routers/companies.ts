import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc/init.js';

const createCompanySchema = z.object({
  name: z.string().min(2).max(200),
  cnpj: z.string().optional(),
  description: z.string().min(10).max(5000),
  shortDescription: z.string().max(150).optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().optional(),
  categoryIds: z.array(z.string()).min(1),
  tags: z.array(z.string()).max(20).optional(),
});

export const companiesRouter = router({
  list: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
      city: z.string().optional(),
      state: z.string().optional(),
      categoryId: z.string().optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const where = {
        status: input.status ?? 'ACTIVE',
        ...(input.city && { city: input.city }),
        ...(input.state && { state: input.state }),
        ...(input.categoryId && {
          categories: { some: { categoryId: input.categoryId } },
        }),
      };

      const [companies, total] = await Promise.all([
        ctx.db.company.findMany({
          where,
          skip,
          take: input.limit,
          include: {
            categories: { include: { category: true } },
            _count: { select: { reviews: true } },
          },
          orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
        }),
        ctx.db.company.count({ where }),
      ]);

      return {
        companies,
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.company.findUnique({
        where: { slug: input.slug },
        include: {
          categories: { include: { category: true } },
          reviews: {
            where: { isApproved: true },
            include: { user: { select: { name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          businessHours: true,
        },
      });

      if (!company) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Empresa não encontrada' });
      }

      // Increment view count
      await ctx.db.company.update({
        where: { id: company.id },
        data: { viewCount: { increment: 1 } },
      });

      return company;
    }),

  create: protectedProcedure
    .input(createCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const slug = input.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const existing = await ctx.db.company.findUnique({ where: { slug } });
      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      const { categoryIds, tags, ...companyData } = input;

      const company = await ctx.db.company.create({
        data: {
          ...companyData,
          slug: finalSlug,
          tags: tags ?? [],
          ownerId: ctx.user.id,
          status: 'PENDING',
          categories: {
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
        },
        include: { categories: { include: { category: true } } },
      });

      return company;
    }),

  update: protectedProcedure
    .input(createCompanySchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, categoryIds, ...data } = input;

      const company = await ctx.db.company.findUnique({ where: { id } });
      if (!company) throw new TRPCError({ code: 'NOT_FOUND' });
      if (company.ownerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const updated = await ctx.db.company.update({
        where: { id },
        data: {
          ...data,
          ...(categoryIds && {
            categories: {
              deleteMany: {},
              create: categoryIds.map((categoryId) => ({ categoryId })),
            },
          }),
        },
        include: { categories: { include: { category: true } } },
      });

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.company.findUnique({ where: { id: input.id } });
      if (!company) throw new TRPCError({ code: 'NOT_FOUND' });
      if (company.ownerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      await ctx.db.company.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
