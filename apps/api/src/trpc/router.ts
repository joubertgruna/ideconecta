import { router } from './init.js';
import { companiesRouter } from '../routers/companies.js';
import { searchRouter } from '../routers/search.js';
import { aiRouter } from '../routers/ai.js';
import { authRouter } from '../routers/auth.js';

export const appRouter = router({
  companies: companiesRouter,
  search: searchRouter,
  ai: aiRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
