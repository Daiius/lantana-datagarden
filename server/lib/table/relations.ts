import { eq, and, isNotNull } from 'drizzle-orm';

import { db } from 'database/db';
import {
  flows,
  flowSteps,
  flowStepColumnGroups,
  columnGroups,
  data,
} from 'database/db/schema';

import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const flowIdsSchema = createSelectSchema(flows).pick({
  projectId: true,
  id: true,
});
export type FlowIds = z.infer<typeof flowIdsSchema>;

export type Relation = {
  id: number;
  parentId: number;
}
/**
 * 親子関係を表す線をUI上に引くために使用する、
 * 指定したflowIdに関連するdataの親子関係を一覧で取得します
 * TODO 想定より困難、更新機能が未実装
 * NOTE
 * flowSteps,flowStepColumnGroups,columnGroups,data までの細かな変更を
 * 検出しないといけないため、当初の想定より難しいです。
 * 現行のContext方式の方が理に適っているかもしれません
 */
export const list = async (flowIds: FlowIds): Promise<Relation[]> => {
  const relationsData = await db.select()
    .from(flows)
    .leftJoin(
      flowSteps,
      and(
        eq(flows.id, flowSteps.flowId),
      ),
    )
    .leftJoin(
      flowStepColumnGroups,
      eq(flowSteps.id, flowStepColumnGroups.flowStepId),
    )
    .leftJoin(
      columnGroups,
      eq(flowStepColumnGroups.columnGroupId, columnGroups.id),
    )
    .leftJoin(
      data,
      and(
        eq(columnGroups.id, data.columnGroupId),
        isNotNull(data.parentId),
      ),
    )
    .where(
      and(
        eq(flows.id, flowIds.id),
        eq(flows.projectId, flowIds.projectId),
      )
    );
  const relations = relationsData.flatMap(r => 
    r.Data == null || r.Data.parentId == null
    ? []
    : ({ id: r.Data.id, parentId: r.Data.parentId })
  );
  return relations;
};

