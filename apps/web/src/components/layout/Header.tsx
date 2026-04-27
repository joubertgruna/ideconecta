import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { SearchBar } from '@/components/ui/SearchBar';
import { cn } from '@/utils/cn';

export function Header() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            IDE
          </span>
          <span className="hidden font-bold text-neutral-900 sm:block">IDEBRASIL</span>
        </Link>

        {/* Search Bar */}
        <div className="hidden flex-1 max-w-lg md:block">
          <SearchBar size="sm" />
        </div>

        {/* Nav */}
        <nav className="ml-auto flex items-center gap-1">
          <Link
            to="/buscar"
            className="hidden px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 sm:block"
          >
            Buscar
          </Link>
          <Link
            to="/anunciar"
            className="hidden rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 sm:block"
          >
            Anunciar
          </Link>

          {isAuthenticated && user ? (
            <div className="relative ml-2">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                  <div className="border-b px-4 py-2">
                    <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Meu Painel
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link
                to="/auth/login"
                className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900"
              >
                Entrar
              </Link>
              <Link
                to="/auth/registro"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Cadastrar
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className={cn('ml-2 rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 md:hidden')}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>
      </div>

      {/* Mobile search */}
      <div className="border-t px-4 py-2 md:hidden">
        <SearchBar size="sm" />
      </div>
    </header>
  );
}
