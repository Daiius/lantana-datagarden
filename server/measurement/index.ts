import { router } from '../trpc';

import { columnGroupRouter } from './columnGroup';
import { columnRouter } from './column';

export const measurementRouter = router({
  columnGroup: columnGroupRouter,
  column: columnRouter,
});

