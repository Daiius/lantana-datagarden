import { 
  projects,
  flows,
  columnGroups,
  columns,
  data,
} from 'database/db/schema';

import type {
  getProjectData
} from '@/lib';

import { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/providers/TrpcProvider';

export type Project     = typeof projects.$inferSelect;
export type Flow        = typeof flows.$inferSelect;
export type ColumnGroup = typeof columnGroups.$inferSelect;
export type Column      = typeof columns.$inferSelect;
export type Data        = typeof data.$inferSelect;

export type ProjectCategoriesColumns = NonNullable<
  Awaited<ReturnType<typeof getProjectData>>
>;
export type FlowColumnGroups = 
  Omit<Flow, 'columnGroups'> 
  & { columnGroups: ColumnGroup[][] };

export type ArrayElement<T> = T extends (infer U)[] ? U : never;

export type FlowWithData = inferRouterOutputs<AppRouter>['flow']['getNestedWithData'];
export type FlowStepWithData = ArrayElement<FlowWithData['flowSteps']>;
export type ColumnGroupWithGrouping = ArrayElement<FlowStepWithData['columnGroupWithGroupings']>;

export { 
  COLUMNS_DATA_TYPES as DataTypes,
  COLUMN_GROUP_TYPES as ColumnGroupTypes,
  validate,
} from 'database/db/schema';

export type { 
  JsonData,
  Grouping,
  FlowStep,
} from 'database/db/schema';

