import { Link } from 'react-router-dom';
import { SearchBar } from '@/components/ui/SearchBar';

const categories = [
  { icon: '🍽️', name: 'Restaurantes', slug: 'restaurantes', count: '2.4k' },
  { icon: '🏥', name: 'Saúde', slug: 'saude', count: '1.8k' },
  { icon: '⚖️', name: 'Advogados', slug: 'advogados', count: '980' },
  { icon: '��', name: 'Imóveis', slug: 'imoveis', count: '3.2k' },
  { icon: '💻', name: 'Tecnologia', slug: 'tecnologia', count: '1.5k' },
  { icon: '🔧', name: 'Serviços', slug: 'servicos', count: '4.1k' },
  { icon: '📚', name: 'Educação', slug: 'educacao', count: '890' },
  { icon: '🚗', name: 'Automóveis', slug: 'automoveis', count: '1.2k' },
];

const aiFeatures = [
  {
    icon: '🔍',
    title: 'Busca Semântica',
    description: 'Nossa IA entende o que você precisa mesmo em linguagem natural. Diga "quero uma pizzaria aconchegante perto de mim" e encontre exatamente isso.',
  },
  {
    icon: '✨',
    title: 'Descrições IA',
    description: 'Empresas cadastradas com nossa IA têm descrições profissionais, tags otimizadas e aparecem mais nos resultados de busca.',
  },
  {
    icon: '💬',
    title: 'Assistente Virtual',
    description: 'Converse com nosso chatbot para obter recomendações personalizadas, comparar empresas e encontrar os melhores serviços.',
  },
];

const howItWorks = [
  { step: '01', title: 'Busque', description: 'Digite o que você precisa ou navegue pelas categorias.' },
  { step: '02', title: 'Compare', description: 'Veja avaliações, fotos e informações completas das empresas.' },
  { step: '03', title: 'Conecte', description: 'Entre em contato diretamente pelo WhatsApp, telefone ou e-mail.' },
];

export function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-1.5 text-sm font-medium text-blue-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Busca com Inteligência Artificial
          </div>

          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Encontre as melhores
            <br />
            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              empresas do Brasil
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100/80">
            Busca inteligente por IA para conectar você aos melhores negócios.
            Mais de <strong className="text-white">50.000 empresas</strong> cadastradas em todo o país.
          </p>

          <div className="mx-auto max-w-2xl">
            <SearchBar
              size="lg"
              placeholder="Busque por empresa, serviço ou categoria..."
              className="shadow-2xl"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-blue-200/70">
            <span>Populares:</span>
            {['Restaurantes', 'Advogados', 'Clínicas', 'Tecnologia', 'Imóveis'].map((term) => (
              <Link
                key={term}
                to={`/buscar?q=${encodeURIComponent(term)}`}
                className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/20 transition"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl divide-x px-4 sm:px-6 lg:px-8">
          {[
            { value: '50k+', label: 'Empresas cadastradas' },
            { value: '500k+', label: 'Buscas mensais' },
            { value: '27', label: 'Estados cobertos' },
            { value: '4.8★', label: 'Avaliação média' },
          ].map(({ value, label }) => (
            <div key={label} className="flex-1 py-4 text-center">
              <p className="text-xl font-bold text-blue-600">{value}</p>
              <p className="text-xs text-neutral-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Explore por Categoria</h2>
            <p className="mt-2 text-neutral-500">Navegue pelas principais categorias de negócios</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {categories.map(({ icon, name, slug, count }) => (
              <Link
                key={slug}
                to={`/buscar?categoria=${slug}`}
                className="group flex flex-col items-center rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <span className="mb-2 text-3xl transition group-hover:scale-110">{icon}</span>
                <span className="text-sm font-medium text-neutral-700">{name}</span>
                <span className="mt-0.5 text-xs text-neutral-400">{count} emp.</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="bg-gradient-to-br from-neutral-900 to-blue-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-1 text-sm text-blue-300">
              ✨ Tecnologia de Ponta
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Impulsionado por Inteligência Artificial
            </h2>
            <p className="mt-3 text-neutral-400">
              Utilizamos IA avançada para tornar sua experiência mais inteligente e eficiente
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {aiFeatures.map(({ icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-blue-400/30 hover:bg-white/10"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-2xl">
                  {icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/anunciar"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-500"
            >
              ✨ Cadastrar minha empresa com IA
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Como Funciona</h2>
            <p className="mt-2 text-neutral-500">Encontre o que precisa em 3 passos simples</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {howItWorks.map(({ step, title, description }) => (
              <div key={step} className="relative rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">{title}</h3>
                <p className="text-sm text-neutral-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Sua empresa merece ser encontrada
          </h2>
          <p className="mt-3 text-neutral-600">
            Cadastre gratuitamente e alcance milhares de clientes em todo o Brasil.
            Planos a partir de R$ 0/mês.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/anunciar"
              className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-blue-700"
            >
              Anunciar Gratuitamente
            </Link>
            <Link
              to="/planos"
              className="rounded-xl border border-neutral-300 bg-white px-8 py-3 font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Ver Planos Premium
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
