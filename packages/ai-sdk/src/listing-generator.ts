import { generateObject } from 'ai';
import { z } from 'zod';
import { getOpenAIProvider, MODELS } from './providers.js';
import { LISTING_SYSTEM_PROMPT, LISTING_USER_PROMPT } from './prompts/listing.js';
import type { AiGenerateListingInput, AiGenerateListingOutput } from '@ideconecta/types';

const listingSchema = z.object({
  name: z.string().describe('Nome oficial da empresa'),
  description: z.string().max(1500).describe('Descrição completa da empresa (até 500 palavras)'),
  shortDescription: z.string().max(150).describe('Descrição curta para cards (até 150 chars)'),
  tags: z.array(z.string()).min(3).max(10).describe('Tags relevantes para busca'),
  suggestedCategories: z.array(z.string()).min(1).max(3).describe('Categorias sugeridas'),
  highlights: z.array(z.string()).min(2).max(5).describe('Destaques / diferenciais da empresa'),
  seoTitle: z.string().max(60).optional().describe('Título SEO'),
  seoDescription: z.string().max(160).optional().describe('Meta description SEO'),
});

export async function generateListing(
  input: AiGenerateListingInput,
  apiKey?: string
): Promise<AiGenerateListingOutput> {
  const start = Date.now();
  const openai = getOpenAIProvider(apiKey);

  const { object } = await generateObject({
    model: openai(MODELS.chat),
    schema: listingSchema,
    system: LISTING_SYSTEM_PROMPT,
    prompt: LISTING_USER_PROMPT(input),
    temperature: 0.7,
  });

  return {
    listing: object,
    confidence: 0.9,
    processingTimeMs: Date.now() - start,
  };
}
