import { generateListing, expandSearchQuery, streamChat, moderateListing } from '@ideconecta/ai-sdk';
import type { AiGenerateListingInput } from '@ideconecta/types';
import type { Redis } from 'ioredis';
import type { PrismaClient } from '@prisma/client';

export class AiService {
  constructor(
    private readonly db: PrismaClient,
    private readonly redis: Redis
  ) {}

  async generateCompanyListing(input: AiGenerateListingInput) {
    const cacheKey = `ai:listing:${Buffer.from(JSON.stringify(input)).toString('base64').slice(0, 32)}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as ReturnType<typeof generateListing>;
    }

    const result = await generateListing(input);
    await this.redis.setex(cacheKey, 3600, JSON.stringify(result));
    return result;
  }

  async semanticSearch(query: string) {
    const cacheKey = `ai:search:${query.toLowerCase().trim()}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as ReturnType<typeof expandSearchQuery>;
    }

    const result = await expandSearchQuery(query);
    await this.redis.setex(cacheKey, 300, JSON.stringify(result));
    return result;
  }

  async moderateContent(content: string) {
    return moderateListing(content);
  }

  streamChatResponse(messages: Parameters<typeof streamChat>[0]) {
    return streamChat(messages);
  }
}
