import { createOpenAI } from 'ai/providers';

export function getOpenAIProvider(apiKey?: string) {
  return createOpenAI({
    apiKey: apiKey ?? process.env['OPENAI_API_KEY'] ?? '',
    compatibility: 'strict',
  });
}

export const MODELS = {
  chat: 'gpt-4o-mini',
  chatAdvanced: 'gpt-4o',
  embedding: 'text-embedding-3-small',
  embeddingLarge: 'text-embedding-3-large',
  moderation: 'text-moderation-latest',
} as const;

export type ModelKey = keyof typeof MODELS;
