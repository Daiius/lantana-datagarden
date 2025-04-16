import { router } from '../trpc';

import { columnGroupRouter } from './columnGroup';
import { columnRouter } from './column';
import { dataRouter } from './data';

export const measurementRouter = router({
  columnGroup: columnGroupRouter,
  column: columnRouter,
  data: dataRouter,
});

