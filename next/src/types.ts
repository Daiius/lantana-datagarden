import { 
  projects,
  flows,
  columnGroups,
  columns,
  data,
  measurementColumnGroups,
  measurementColumns,
  measurements,
} from 'database/db/schema';

import type {
  getProjectData
} from '@/lib';


export type ArrayElement<T> = T extends (infer U)[] ? U : never;

export type Project     = typeof projects.$inferSelect;
export type Flow        = typeof flows.$inferSelect;

export type ColumnGroup = typeof columnGroups.$inferSelect;
export type Column      = typeof columns.$inferSelect;
export type Data        = typeof data.$inferSelect;

// Measurements
export type MeasurementColumnGroup = typeof measurementColumnGroups.$inferSelect;
export type MeasurementColumn = typeof measurementColumns.$inferSelect;
export type Measurement = typeof measurements.$inferSelect;


export type MeasurementColumnGroupWithColumns =
  MeasurementColumnGroup & { columns: MeasurementColumn[] };

export type MeasurementColumnGroupWithColumnsAndData =
  MeasurementColumnGroupWithColumns & { data: Measurement[] };

export type ProjectCategoriesColumns = NonNullable<
  Awaited<ReturnType<typeof getProjectData>>
>;
export type FlowColumnGroups = 
  Omit<Flow, 'columnGroups'> 
  & { columnGroups: ColumnGroup[][] };


export { 
  COLUMNS_DATA_TYPES as DataTypes,
  MEASUREMENT_VISUAL_TYPES as MeasurementVisuals,
  validate,
} from 'database/db/schema';

export type { 
  JsonData,
  Grouping,
  FlowStep,
} from 'database/db/schema';

