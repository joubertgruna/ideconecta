import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AiListingAssistant } from '@/features/ai/AiListingAssistant';
import { api } from '@/lib/api';
import { isValidCNPJ, formatCEP } from '@/utils/formatters';
import type { AiGeneratedListing } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  cnpj: z.string().refine((v) => !v || isValidCNPJ(v), 'CNPJ inválido').optional().or(z.literal('')),
  description: z.string().min(50, 'Descrição deve ter ao menos 50 caracteres'),
  shortDescription: z.string().max(150).optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  { id: 1, title: 'Informações Básicas' },
  { id: 2, title: 'Endereço' },
  { id: 3, title: 'Contato' },
  { id: 4, title: 'Revisão' },
];

export function AdvertisePage() {
  const [step, setStep] = useState(1);
  const [useAi, setUseAi] = useState(true);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/trpc/companies.create', {
        json: {
          ...data,
          tags: data.tags?.split(',').map((t) => t.trim()).filter(Boolean) ?? [],
          categoryIds: ['default'],
        },
      });
      return response.data;
    },
    onSuccess: () => {
      navigate('/dashboard');
    },
  });

  const handleAiGenerated = (listing: AiGeneratedListing) => {
    setValue('description', listing.description);
    setValue('shortDescription', listing.shortDescription);
    setValue('tags', listing.tags.join(', '));
  };

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Anunciar minha empresa</h1>
        <p className="mt-2 text-neutral-500">
          Cadastre sua empresa e alcance milhares de clientes em todo o Brasil
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map(({ id, title }) => (
          <div key={id} className="flex items-center gap-2">
            <button
              onClick={() => id < step && setStep(id)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
                id === step
                  ? 'bg-blue-600 text-white'
                  : id < step
                  ? 'bg-green-600 text-white cursor-pointer'
                  : 'bg-neutral-200 text-neutral-500'
              }`}
            >
              {id < step ? '✓' : id}
            </button>
            <span className={`hidden text-xs sm:block ${id === step ? 'font-medium text-neutral-900' : 'text-neutral-400'}`}>
              {title}
            </span>
            {id < STEPS.length && <div className="mx-1 h-px w-6 bg-neutral-200" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <div className="space-y-6">
            {/* AI Assistant toggle */}
            <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div>
                <p className="font-medium text-neutral-900">✨ Usar IA para criar minha descrição</p>
                <p className="text-sm text-neutral-500">Nossa IA gera uma descrição profissional automaticamente</p>
              </div>
              <button
                type="button"
                onClick={() => setUseAi(!useAi)}
                className={`relative h-6 w-11 rounded-full transition-colors ${useAi ? 'bg-blue-600' : 'bg-neutral-300'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${useAi ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {useAi && (
              <AiListingAssistant
                onGenerated={handleAiGenerated}
                className="mb-4"
              />
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Nome da empresa *</label>
              <input
                {...register('name')}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Nome da sua empresa"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">CNPJ</label>
              <input
                {...register('cnpj')}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="00.000.000/0001-00"
              />
              {errors.cnpj && <p className="mt-1 text-sm text-red-600">{errors.cnpj.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Descrição completa *</label>
              <textarea
                {...register('description')}
                rows={5}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Descreva sua empresa, produtos e serviços..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Tags (separadas por vírgula)</label>
              <input
                {...register('tags')}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="restaurante, almoço, delivery, são paulo"
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Próximo →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">CEP</label>
              <input
                {...register('zipCode')}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                placeholder="00000-000"
                onChange={(e) => {
                  const formatted = formatCEP(e.target.value);
                  setValue('zipCode', formatted);
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Rua</label>
                <input {...register('street')} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Número</label>
                <input {...register('number')} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Cidade</label>
                <input {...register('city')} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Estado</label>
                <select {...register('state')} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none">
                  <option value="">Selecione</option>
                  {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-xl border border-neutral-200 py-3 font-medium text-neutral-700 hover:bg-neutral-50">
                ← Voltar
              </button>
              <button type="button" onClick={() => setStep(3)} className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
                Próximo →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">E-mail</label>
              <input {...register('email')} type="email" className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" placeholder="contato@empresa.com" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Telefone</label>
              <input {...register('phone')} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" placeholder="(11) 99999-9999" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">WhatsApp</label>
              <input {...register('whatsapp')} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" placeholder="(11) 99999-9999" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Website</label>
              <input {...register('website')} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" placeholder="https://suaempresa.com.br" />
              {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-xl border border-neutral-200 py-3 font-medium text-neutral-700 hover:bg-neutral-50">
                ← Voltar
              </button>
              <button type="button" onClick={() => setStep(4)} className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
                Revisar →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-neutral-900">Revisão dos dados</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2"><dt className="w-28 text-neutral-500">Nome:</dt><dd className="font-medium">{watch('name')}</dd></div>
                <div className="flex gap-2"><dt className="w-28 text-neutral-500">Cidade:</dt><dd>{watch('city')}, {watch('state')}</dd></div>
                <div className="flex gap-2"><dt className="w-28 text-neutral-500">E-mail:</dt><dd>{watch('email')}</dd></div>
                <div className="flex gap-2"><dt className="w-28 text-neutral-500">Telefone:</dt><dd>{watch('phone')}</dd></div>
              </dl>
            </div>

            {createMutation.isError && (
              <p className="text-center text-sm text-red-600">
                Erro ao cadastrar empresa. Verifique os dados e tente novamente.
              </p>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="flex-1 rounded-xl border border-neutral-200 py-3 font-medium text-neutral-700 hover:bg-neutral-50">
                ← Voltar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {createMutation.isPending ? 'Cadastrando...' : '✓ Publicar empresa'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
