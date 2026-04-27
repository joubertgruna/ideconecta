export interface AiGenerateListingInput {
  businessName: string;
  businessType?: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  additionalInfo?: string;
  language?: 'pt-BR' | 'en';
}

export interface AiGeneratedListing {
  name: string;
  description: string;
  shortDescription: string;
  tags: string[];
  suggestedCategories: string[];
  highlights: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface AiGenerateListingOutput {
  listing: AiGeneratedListing;
  confidence: number;
  processingTimeMs: number;
}

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface AiSearchQuery {
  originalQuery: string;
  expandedQuery?: string;
  intent?: 'find_business' | 'get_info' | 'compare' | 'review' | 'other';
  entities?: {
    businessTypes?: string[];
    locations?: string[];
    services?: string[];
  };
  embedding?: number[];
}

export interface AiModerationResult {
  isApproved: boolean;
  score: number;
  flags: string[];
  suggestions: string[];
}

export interface StreamChunk {
  type: 'text' | 'tool_call' | 'done' | 'error';
  content?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  error?: string;
}
