import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPhone } from '@/utils/formatters';
import type { Company } from '@/types';

export function CompanyPage() {
  const { id: slug } = useParams<{ id: string }>();

  const { data: company, isLoading, isError } = useQuery<Company>({
    queryKey: ['company', slug],
    queryFn: async () => {
      const response = await api.get<{ result: { data: Company } }>('/trpc/companies.getBySlug', {
        params: { input: JSON.stringify({ slug }) },
      });
      return response.data.result.data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-48 rounded-xl bg-neutral-200" />
          <div className="h-8 w-1/2 rounded bg-neutral-200" />
          <div className="h-4 rounded bg-neutral-200" />
          <div className="h-4 w-3/4 rounded bg-neutral-200" />
        </div>
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 text-center">
        <p className="text-4xl">🏢</p>
        <h2 className="mt-2 text-xl font-bold text-neutral-900">Empresa não encontrada</h2>
        <p className="text-neutral-500">A empresa que você procura não existe ou foi removida.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Cover Image */}
      {company.coverImageUrl ? (
        <img
          src={company.coverImageUrl}
          alt={`${company.name} capa`}
          className="mb-6 h-48 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="mb-6 h-48 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700" />
      )}

      <div className="flex gap-6">
        {/* Logo */}
        <div className="relative -mt-12 h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-white shadow-md">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-3xl">🏢</div>
          )}
        </div>

        <div className="mt-4 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{company.name}</h1>
              {company.rating && (
                <span className="text-amber-500 font-medium">
                  ★ {company.rating.toFixed(1)} ({company.reviewCount} avaliações)
                </span>
              )}
            </div>
            {company.whatsapp && (
              <a
                href={`https://wa.me/55${company.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                📱 WhatsApp
              </a>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {company.categories?.map((cat) => (
              <span key={cat.id} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {cat.name}
              </span>
            ))}
            {company.city && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-500">
                📍 {company.city}, {company.state}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 font-semibold text-neutral-900">Sobre a empresa</h2>
            <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{company.description}</p>
          </div>

          {/* Tags */}
          {company.tags?.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-semibold text-neutral-900">Tags</h2>
              <div className="flex flex-wrap gap-1.5">
                {company.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-neutral-900">Contato</h3>
            <div className="space-y-2 text-sm">
              {company.phone && (
                <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-neutral-600 hover:text-blue-600">
                  📞 {formatPhone(company.phone)}
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-neutral-600 hover:text-blue-600 break-all">
                  ✉️ {company.email}
                </a>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-neutral-600 hover:text-blue-600">
                  🌐 Website
                </a>
              )}
            </div>
          </div>

          {company.address && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 font-semibold text-neutral-900">Endereço</h3>
              <p className="text-sm text-neutral-500">
                {company.address.street}, {company.address.number}
                {company.address.complement && `, ${company.address.complement}`}
                <br />
                {company.address.neighborhood}, {company.address.city} - {company.address.state}
                <br />
                CEP: {company.address.zipCode}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
