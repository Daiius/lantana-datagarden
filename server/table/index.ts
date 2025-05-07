import { router } from '../trpc';

import { relationsRouter } from './relations';

export const tableRouter = router({
  relations: relationsRouter,
});

