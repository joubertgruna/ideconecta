import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3001';

export const handlers = [
  http.get(`${API_URL}/health`, () => {
    return HttpResponse.json({
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    });
  }),

  http.get(`${API_URL}/trpc/search.search`, () => {
    return HttpResponse.json({
      result: {
        data: {
          companies: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        },
      },
    });
  }),
];
