import type { PrismaClient } from '@prisma/client';
import type { SearchParams } from '@ideconecta/types';

export class SearchService {
  constructor(private readonly db: PrismaClient) {}

  async search(params: SearchParams) {
    const {
      query,
      categoryId,
      city,
      state,
      page = 1,
      limit = 20,
      sortBy = 'relevance',
    } = params;

    const skip = (page - 1) * limit;

    const where = {
      status: 'ACTIVE' as const,
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { shortDescription: { contains: query, mode: 'insensitive' as const } },
        { tags: { hasSome: [query] } },
      ],
      ...(categoryId && { categories: { some: { categoryId } } }),
      ...(city && { city: { contains: city, mode: 'insensitive' as const } }),
      ...(state && { state }),
    };

    const orderBy = this.buildOrderBy(sortBy);

    const [companies, total] = await Promise.all([
      this.db.company.findMany({
        where,
        skip,
        take: limit,
        include: {
          categories: { include: { category: true } },
        },
        orderBy,
      }),
      this.db.company.count({ where }),
    ]);

    return {
      companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + companies.length < total,
      hasPreviousPage: page > 1,
    };
  }

  private buildOrderBy(sortBy: string): Record<string, string>[] {
    switch (sortBy) {
      case 'rating': return [{ rating: 'desc' }];
      case 'newest': return [{ createdAt: 'desc' }];
      case 'name': return [{ name: 'asc' }];
      default: return [{ isFeatured: 'desc' }, { rating: 'desc' }, { viewCount: 'desc' }];
    }
  }
}
