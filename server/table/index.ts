import { router } from '../trpc';

import { relationsRouter } from './relations';
import { followingColumnGroupsRouter } from './followingColumnGroups';

export const tableRouter = router({
  relations: relationsRouter,
  followingColumnGroups: followingColumnGroupsRouter,
});

