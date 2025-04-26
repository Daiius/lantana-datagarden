import { router } from '../trpc';

import { columnGroupRouter } from './columnGroup';
import { columnRouter } from './column';
import { dataRouter } from './data';
import { columnGroupMeasurementRouter } from './columnGroupMeasurement';

export const conditionRouter = router({
  columnGroup: columnGroupRouter,
  column: columnRouter,
  data: dataRouter,
  columnGroupMeasurement: columnGroupMeasurementRouter,
});

