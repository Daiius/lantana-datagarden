import { eq, and } from 'drizzle-orm';

import { db } from 'database/db';
import {
  flows,
  columnGroups,
} from 'database/db/schema';

import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const flowIdsSchema = createSelectSchema(flows).pick({
  projectId: true,
  id: true,
});

export type FlowIds = z.infer<typeof flowIdsSchema>;

export const columnGroupSchema = createSelectSchema(columnGroups);
export type ColumnGroup = z.infer<typeof columnGroupSchema>;


export const list = async (flowIds: FlowIds): Promise<ColumnGroup[][]> => {
  const data = await db.query.flows.findFirst({
    where: 
      and(
        eq(flows.id, flowIds.id),
        eq(flows.projectId, flowIds.projectId),
      ),
    with: {
      flowSteps: {
        with: {
          flowStepColumnGroups: {
            with: {
              columnGroup: true,
            }
          }
        }
      }
    },
  });
  if (data == null) throw new Error(
    `cannot find flow ${flowIds.id}`
  );
  const result = data.flowSteps.map(flowStep =>
    flowStep.flowStepColumnGroups.map(fscg => fscg.columnGroup)
  );
  return result;
}

