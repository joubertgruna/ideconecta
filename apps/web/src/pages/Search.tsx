import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SearchBar } from '@/components/ui/SearchBar';
import { useSearch } from '@/features/search/useSearch';
import { cn } from '@/utils/cn';
import type { Company } from '@/types';

const sortOptions = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'newest', label: 'Mais recentes' },
  { value: 'name', label: 'Nome A-Z' },
];

function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      to={`/empresa/${company.slug}`}
      className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
        {company.logoUrl ? (
          <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">🏢</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-neutral-900 truncate">{company.name}</h3>
          {company.rating && (
            <span className="shrink-0 text-sm text-amber-500 font-medium">
              ★ {company.rating.toFixed(1)}
            </span>
          )}
        </div>

        {company.shortDescription && (
          <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{company.shortDescription}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-1.5">
          {company.categories?.slice(0, 2).map((cat) => (
            <span
              key={cat.id}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              {cat.name}
            </span>
          ))}
          {company.city && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
              📍 {company.city}, {company.state}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('relevance');

  const { data, isLoading, isError } = useSearch({ sortBy: sortBy as 'relevance' | 'rating' | 'newest' | 'name' });

  const query = searchParams.get('q') ?? '';
  const total = data?.total ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Search header */}
      <div className="mb-6">
        <SearchBar defaultValue={query} size="sm" className="max-w-2xl" />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            {isLoading ? 'Buscando...' : `${total.toLocaleString('pt-BR')} resultado${total !== 1 ? 's' : ''} para "${query}"`}
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            {sortOptions.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-neutral-900">Filtros</h3>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Cidade</label>
              <input
                type="text"
                placeholder="Ex: São Paulo"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  if (e.target.value) params.set('cidade', e.target.value);
                  else params.delete('cidade');
                  setSearchParams(params);
                }}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Estado</label>
              <select
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  if (e.target.value) params.set('estado', e.target.value);
                  else params.delete('estado');
                  setSearchParams(params);
                }}
              >
                <option value="">Todos os estados</option>
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Busca por IA</label>
              <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded"
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams);
                    if (e.target.checked) params.set('ia', '1');
                    else params.delete('ia');
                    setSearchParams(params);
                  }}
                />
                Busca semântica com IA ✨
              </label>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-neutral-200" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-600">Erro ao realizar a busca. Tente novamente.</p>
            </div>
          )}

          {!isLoading && !isError && data?.companies.length === 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
              <p className="text-4xl mb-3">🔍</p>
              <h3 className="text-lg font-semibold text-neutral-900">Nenhum resultado encontrado</h3>
              <p className="mt-1 text-neutral-500">Tente outros termos ou remova filtros</p>
            </div>
          )}

          {!isLoading && !isError && data && data.companies.length > 0 && (
            <>
              <div className="space-y-3">
                {data.companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  {[...Array(Math.min(data.totalPages, 5))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('pagina', String(i + 1));
                        setSearchParams(params);
                      }}
                      className={cn(
                        'h-9 w-9 rounded-lg text-sm font-medium transition',
                        data.page === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
