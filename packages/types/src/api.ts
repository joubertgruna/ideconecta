export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    stack?: string;
  };
  timestamp: string;
}

export type ApiResult<T> = ApiResponse<T> | ErrorResponse;

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  timestamp: string;
  services: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error';
    ai: 'ok' | 'error';
  };
}
