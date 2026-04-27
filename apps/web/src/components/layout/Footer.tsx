import { Link } from 'react-router-dom';

const footerLinks = {
  empresa: [
    { label: 'Sobre Nós', href: '/sobre' },
    { label: 'Blog', href: '/blog' },
    { label: 'Carreiras', href: '/carreiras' },
    { label: 'Imprensa', href: '/imprensa' },
  ],
  servicos: [
    { label: 'Buscar Empresas', href: '/buscar' },
    { label: 'Anunciar', href: '/anunciar' },
    { label: 'Planos', href: '/planos' },
    { label: 'API', href: '/api-docs' },
  ],
  suporte: [
    { label: 'Central de Ajuda', href: '/ajuda' },
    { label: 'Contato', href: '/contato' },
    { label: 'Política de Privacidade', href: '/privacidade' },
    { label: 'Termos de Uso', href: '/termos' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-900 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                IDE
              </span>
              <span className="font-bold text-white">IDEBRASIL</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              Encontre as melhores empresas do Brasil com busca inteligente por IA.
              Conectamos você aos negócios mais relevantes da sua região.
            </p>
            <div className="mt-4 flex gap-3">
              {['Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-400 transition hover:bg-blue-600 hover:text-white"
                  aria-label={social}
                >
                  {social.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-200">
                {section === 'empresa' ? 'Empresa' : section === 'servicos' ? 'Serviços' : 'Suporte'}
              </h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-neutral-400 transition hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-neutral-800 pt-6 text-center text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} IDEBRASIL. Todos os direitos reservados.</p>
          <p className="mt-1">CNPJ: 00.000.000/0001-00 · São Paulo, SP · Brasil</p>
        </div>
      </div>
    </footer>
  );
}
