import { embed, generateObject } from 'ai';
import { z } from 'zod';
import { getOpenAIProvider, MODELS } from './providers.js';
import { SEARCH_EXPANSION_PROMPT, SEMANTIC_SEARCH_PROMPT } from './prompts/search.js';
import type { AiSearchQuery } from '@ideconecta/types';

export async function generateEmbedding(text: string, apiKey?: string): Promise<number[]> {
  const openai = getOpenAIProvider(apiKey);
  const { embedding } = await embed({
    model: openai.embedding(MODELS.embedding),
    value: text,
  });
  return embedding;
}

export async function expandSearchQuery(query: string, apiKey?: string): Promise<AiSearchQuery> {
  const openai = getOpenAIProvider(apiKey);

  const { object } = await generateObject({
    model: openai(MODELS.chat),
    schema: z.object({
      expandedQuery: z.string(),
      intent: z.enum(['find_business', 'get_info', 'compare', 'review', 'other']),
      entities: z.object({
        businessTypes: z.array(z.string()).optional(),
        locations: z.array(z.string()).optional(),
        services: z.array(z.string()).optional(),
      }),
      searchTerms: z.array(z.string()),
    }),
    system: SEARCH_EXPANSION_PROMPT,
    prompt: SEMANTIC_SEARCH_PROMPT(query),
  });

  const embedding = await generateEmbedding(object.expandedQuery, apiKey);

  return {
    originalQuery: query,
    expandedQuery: object.expandedQuery,
    intent: object.intent,
    entities: object.entities,
    embedding,
  };
}
