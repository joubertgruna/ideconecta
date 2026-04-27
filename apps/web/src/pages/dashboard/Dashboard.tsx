import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { Company } from '@/types';

export function DashboardPage() {
  const { user } = useAuthStore();

  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ['myCompanies'],
    queryFn: async () => {
      const response = await api.get<{ result: { data: { companies: Company[] } } }>(
        '/trpc/companies.list',
        { params: { input: JSON.stringify({ limit: 50 }) } }
      );
      return response.data.result.data.companies;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-4xl">🔒</p>
          <h2 className="mt-2 text-xl font-bold">Acesso restrito</h2>
          <p className="text-neutral-500">Você precisa estar logado para acessar o painel.</p>
          <Link to="/auth/login" className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-2 text-white">
            Entrar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Olá, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-neutral-500">Gerencie suas empresas cadastradas</p>
        </div>
        <Link
          to="/anunciar"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Nova empresa
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Empresas cadastradas', value: companies?.length ?? 0, icon: '🏢' },
          { label: 'Visualizações totais', value: companies?.reduce((acc, c) => acc + (c.viewCount ?? 0), 0) ?? 0, icon: '👁️' },
          { label: 'Cliques totais', value: companies?.reduce((acc, c) => acc + (c.clickCount ?? 0), 0) ?? 0, icon: '🖱️' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">{label}</p>
              <span className="text-2xl">{icon}</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-neutral-900">{value.toLocaleString('pt-BR')}</p>
          </div>
        ))}
      </div>

      {/* Companies list */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-neutral-900">Minhas empresas</h2>
        </div>

        {isLoading && (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-100" />
            ))}
          </div>
        )}

        {!isLoading && (!companies || companies.length === 0) && (
          <div className="py-12 text-center">
            <p className="text-4xl">🏢</p>
            <h3 className="mt-2 font-semibold text-neutral-900">Nenhuma empresa cadastrada</h3>
            <p className="mt-1 text-sm text-neutral-500">Comece cadastrando sua primeira empresa</p>
            <Link
              to="/anunciar"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Cadastrar empresa
            </Link>
          </div>
        )}

        {!isLoading && companies && companies.length > 0 && (
          <div className="divide-y">
            {companies.map((company) => (
              <div key={company.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">🏢</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{company.name}</p>
                    <p className="text-xs text-neutral-500">{company.city}, {company.state}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    company.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : company.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {company.status === 'active' ? 'Ativo' : company.status === 'pending' ? 'Pendente' : 'Inativo'}
                  </span>

                  <Link
                    to={`/empresa/${company.slug}`}
                    className="rounded-lg border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
