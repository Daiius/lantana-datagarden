import { router, publicProcedure } from '../trpc';

import {
  list,
  flowIdsSchema,
} from '../lib/table/relations';

import { createSubscription } from '../lib/common';

import { tableEventEmitter as ee } from '../events';

export const relationsRouter = router({
  list: publicProcedure
    .input(flowIdsSchema)
    .query(async ({ input }) => await list(input)),
  onUpdate: publicProcedure
    .input(flowIdsSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onUpdate',
      filter: data => (
           data.projectId === input.projectId
        && data.id === input.id
      ),
    })),
});

