import { z } from 'zod';
import { router, publicProcedure } from '../trpc/init.js';

export const searchRouter = router({
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      categoryId: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
      sortBy: z.enum(['relevance', 'rating', 'newest', 'name']).default('relevance'),
      useSemanticSearch: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const where = {
        status: 'ACTIVE' as const,
        OR: [
          { name: { contains: input.query, mode: 'insensitive' as const } },
          { description: { contains: input.query, mode: 'insensitive' as const } },
          { tags: { has: input.query } },
        ],
        ...(input.categoryId && {
          categories: { some: { categoryId: input.categoryId } },
        }),
        ...(input.city && { city: { contains: input.city, mode: 'insensitive' as const } }),
        ...(input.state && { state: input.state }),
      };

      const orderBy: Record<string, string>[] = [];
      if (input.sortBy === 'rating') orderBy.push({ rating: 'desc' });
      else if (input.sortBy === 'newest') orderBy.push({ createdAt: 'desc' });
      else if (input.sortBy === 'name') orderBy.push({ name: 'asc' });
      else orderBy.push({ isFeatured: 'desc' }, { rating: 'desc' });

      const [companies, total] = await Promise.all([
        ctx.db.company.findMany({
          where,
          skip,
          take: input.limit,
          include: {
            categories: { include: { category: true } },
          },
          orderBy,
        }),
        ctx.db.company.count({ where }),
      ]);

      return {
        companies,
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
        hasNextPage: skip + companies.length < total,
        hasPreviousPage: input.page > 1,
      };
    }),

  autocomplete: publicProcedure
    .input(z.object({ query: z.string().min(1), limit: z.number().max(10).default(5) }))
    .query(async ({ ctx, input }) => {
      const companies = await ctx.db.company.findMany({
        where: {
          status: 'ACTIVE',
          name: { contains: input.query, mode: 'insensitive' },
        },
        take: input.limit,
        select: { id: true, name: true, logoUrl: true, slug: true },
        orderBy: { viewCount: 'desc' },
      });

      const categories = await ctx.db.category.findMany({
        where: { name: { contains: input.query, mode: 'insensitive' } },
        take: 5,
        select: { id: true, name: true, slug: true, icon: true },
      });

      return { companies, categories };
    }),
});
