import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AiGenerateListingInput, AiGenerateListingOutput } from '@/types';

export function useAiListing() {
  return useMutation<AiGenerateListingOutput, Error, AiGenerateListingInput>({
    mutationFn: async (input) => {
      const response = await api.post<{ result: { data: AiGenerateListingOutput } }>(
        '/trpc/ai.generateListing',
        { json: input }
      );
      return response.data.result.data;
    },
  });
}
