import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useAutocomplete } from '@/features/search/useSearch';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  className?: string;
  size?: 'sm' | 'lg';
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  className,
  size = 'sm',
  placeholder = 'Buscar empresas, serviços...',
  defaultValue = '',
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 200);
  const { data: suggestions } = useAutocomplete(debouncedQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/buscar?q=${encodeURIComponent(query)}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasSuggestions =
    showSuggestions &&
    debouncedQuery.length >= 2 &&
    ((suggestions?.companies?.length ?? 0) > 0 || (suggestions?.categories?.length ?? 0) > 0);

  return (
    <div className={cn('relative w-full', className)} ref={inputRef as React.RefObject<HTMLDivElement>}>
      <form onSubmit={handleSearch} className="flex">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-l-xl border border-r-0 border-neutral-200 bg-white px-4 shadow-sm transition-all',
            'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            size === 'lg' ? 'h-14 text-base' : 'h-10 text-sm'
          )}
        />
        <button
          type="submit"
          className={cn(
            'rounded-r-xl bg-blue-600 px-5 font-medium text-white shadow-sm transition hover:bg-blue-700',
            size === 'lg' ? 'h-14 text-base' : 'h-10 text-sm'
          )}
        >
          Buscar
        </button>
      </form>

      {hasSuggestions && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg">
          {(suggestions?.categories?.length ?? 0) > 0 && (
            <div className="p-2">
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Categorias</p>
              {suggestions!.categories.map((cat) => (
                <button
                  key={cat.id}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50"
                  onClick={() => {
                    navigate(`/buscar?categoria=${cat.slug}`);
                    setShowSuggestions(false);
                  }}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
            </div>
          )}
          {(suggestions?.companies?.length ?? 0) > 0 && (
            <div className="border-t p-2">
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Empresas</p>
              {suggestions!.companies.map((company) => (
                <button
                  key={company.id}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50"
                  onClick={() => {
                    navigate(`/empresa/${company.slug}`);
                    setShowSuggestions(false);
                  }}
                >
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="h-6 w-6 rounded object-cover" />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-neutral-100 text-xs">🏢</span>
                  )}
                  {company.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
