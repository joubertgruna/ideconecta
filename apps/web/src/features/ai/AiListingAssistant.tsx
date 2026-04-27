import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAiListing } from './useAiListing';
import { cn } from '@/utils/cn';
import type { AiGeneratedListing } from '@/types';

const schema = z.object({
  businessName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  businessType: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  additionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AiListingAssistantProps {
  onGenerated?: (listing: AiGeneratedListing) => void;
  className?: string;
}

export function AiListingAssistant({ onGenerated, className }: AiListingAssistantProps) {
  const [step, setStep] = useState<'form' | 'result'>('form');
  const { mutate, data, isPending, error } = useAiListing();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    mutate(data, {
      onSuccess: (result) => {
        setStep('result');
        onGenerated?.(result.listing);
      },
    });
  };

  return (
    <div className={cn('rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6', className)}>
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
          ✨
        </span>
        <div>
          <h3 className="font-semibold text-neutral-900">Assistente IA</h3>
          <p className="text-sm text-neutral-500">Crie sua descrição profissional com IA</p>
        </div>
      </div>

      {step === 'form' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Nome da empresa *
            </label>
            <input
              {...register('businessName')}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ex: Padaria Pão de Mel"
            />
            {errors.businessName && (
              <p className="mt-1 text-xs text-red-600">{errors.businessName.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Tipo de negócio
            </label>
            <input
              {...register('businessType')}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ex: Padaria artesanal, Consultoria de TI"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Informações sobre o negócio
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Conte um pouco sobre seus produtos, serviços e diferenciais..."
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Gerando com IA...
              </>
            ) : (
              <>✨ Gerar Descrição Profissional</>
            )}
          </button>

          {error && (
            <p className="text-center text-sm text-red-600">
              Erro ao gerar descrição. Tente novamente.
            </p>
          )}
        </form>
      )}

      {step === 'result' && data && (
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-1 text-sm font-semibold text-neutral-700">Descrição gerada:</h4>
            <p className="text-sm text-neutral-600">{data.listing.shortDescription}</p>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-neutral-700">Tags sugeridas:</h4>
            <div className="flex flex-wrap gap-1.5">
              {data.listing.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep('form')}
            className="w-full rounded-lg border border-neutral-200 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            Gerar novamente
          </button>
        </div>
      )}
    </div>
  );
}
