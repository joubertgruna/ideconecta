export type CompanyStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type ListingPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  listingCount?: number;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface BusinessHours {
  dayOfWeek: number; // 0 = Sunday
  openTime: string; // HH:MM
  closeTime: string; // HH:MM
  isClosed: boolean;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  cnpj?: string;
  description: string;
  shortDescription?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  images?: string[];
  website?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: Address;
  // Flat city/state fields (Prisma schema stores these at root level)
  city?: string;
  state?: string;
  categories: Category[];
  tags: string[];
  status: CompanyStatus;
  plan: ListingPlan;
  rating?: number;
  reviewCount?: number;
  viewCount: number;
  clickCount: number;
  isFeatured: boolean;
  featuredUntil?: string;
  businessHours?: BusinessHours[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  aiGeneratedDescription?: boolean;
  embeddingUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface Listing extends Company {
  // viewCount, clickCount, isFeatured, featuredUntil already on Company
}

export interface CreateCompanyInput {
  name: string;
  cnpj?: string;
  description: string;
  shortDescription?: string;
  website?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: Omit<Address, 'latitude' | 'longitude'>;
  categoryIds: string[];
  tags?: string[];
  plan?: ListingPlan;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  id: string;
}
