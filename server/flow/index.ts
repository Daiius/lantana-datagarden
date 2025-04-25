import { router } from '../trpc';

import { flowRouter as _flowRouter } from './flow';
import { flowStepRouter } from './flowStep';
import { flowStepColumnGroupRouter } from './flowStepColumnGroup';

export const flowRouter = router({
  flow: _flowRouter,
  flowStep: flowStepRouter,
  flowStepColumnGroup: flowStepColumnGroupRouter,
});

