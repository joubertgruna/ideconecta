import OpenAI from 'openai';
import type { AiModerationResult } from '@ideconecta/types';

export async function moderateListing(
  content: string,
  apiKey?: string
): Promise<AiModerationResult> {
  const client = new OpenAI({ apiKey: apiKey ?? process.env['OPENAI_API_KEY'] });

  const response = await client.moderations.create({ input: content });
  const result = response.results[0];

  if (!result) {
    return { isApproved: true, score: 0, flags: [], suggestions: [] };
  }

  const flags: string[] = [];
  const categories = result.categories as Record<string, boolean>;
  const scores = result.category_scores as Record<string, number>;

  for (const [category, flagged] of Object.entries(categories)) {
    if (flagged) flags.push(category);
  }

  const maxScore = Math.max(...Object.values(scores));

  return {
    isApproved: !result.flagged,
    score: maxScore,
    flags,
    suggestions: flags.length > 0
      ? ['Revise o conteúdo antes de publicar', 'Remova linguagem inadequada']
      : [],
  };
}
