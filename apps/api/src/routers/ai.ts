import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc/init.js';
import { generateListing, expandSearchQuery } from '@ideconecta/ai-sdk';

export const aiRouter = router({
  generateListing: protectedProcedure
    .input(z.object({
      businessName: z.string().min(2),
      businessType: z.string().optional(),
      description: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      additionalInfo: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await generateListing(input);
      return result;
    }),

  semanticSearch: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const expanded = await expandSearchQuery(input.query);
      return expanded;
    }),

  chatbot: publicProcedure
    .input(z.object({
      messages: z.array(z.object({
        id: z.string(),
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
        createdAt: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      // For streaming, this returns a token stream
      // In production, use SSE / WebSocket for streaming
      return { message: 'Streaming endpoint - use /api/chat/stream instead' };
    }),
});
