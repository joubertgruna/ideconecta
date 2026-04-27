import type { Company, Category } from './company.js';

export interface SearchParams {
  query: string;
  categoryId?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  radius?: number; // km
  rating?: number;
  plan?: string[];
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'rating' | 'distance' | 'newest' | 'name';
  sortOrder?: 'asc' | 'desc';
  useSemanticSearch?: boolean;
}

export interface SearchFacet {
  key: string;
  value: string;
  count: number;
}

export interface SearchFacets {
  categories: SearchFacet[];
  cities: SearchFacet[];
  states: SearchFacet[];
  tags: SearchFacet[];
  ratings: SearchFacet[];
}

export interface SearchResult {
  companies: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: SearchFacets;
  queryTime?: number;
  didYouMean?: string;
  semanticQuery?: string;
}

export interface VectorSearchResult {
  companyId: string;
  score: number;
  company?: Company;
}

export interface AutocompleteResult {
  suggestions: string[];
  categories: Category[];
  companies: Array<{ id: string; name: string; logoUrl?: string }>;
}
