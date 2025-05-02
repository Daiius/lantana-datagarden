import { 
  projects,
  flows,
  flowSteps,
  flowStepColumnGroups,
  columnGroups,
  columns,
  data,
  measurementColumnGroups,
  measurementColumns,
  columnGroupMeasurements,
  measurements,
} from 'database/db/schema';


export type ArrayElement<T> = T extends (infer U)[] ? U : never;

export type Project = typeof projects.$inferSelect;

export type Flow = typeof flows.$inferSelect;
export type FlowStep = typeof flowSteps.$inferSelect;
export type FlowStepColumnGroup = typeof flowStepColumnGroups.$inferSelect;

export type ColumnGroup = typeof columnGroups.$inferSelect;
export type ColumnGroupMeasurement = typeof columnGroupMeasurements.$inferSelect;

export type Column      = typeof columns.$inferSelect;

export type Data        = typeof data.$inferSelect;
export type DataIds = Pick<Data, 'projectId'|'columnGroupId'|'id'>;

// Measurements
export type MeasurementColumnGroup = typeof measurementColumnGroups.$inferSelect;
export type MeasurementColumn = typeof measurementColumns.$inferSelect;
export type Measurement = typeof measurements.$inferSelect;



export { 
  COLUMNS_DATA_TYPES as DataTypes,
  MEASUREMENT_VISUAL_TYPES as MeasurementVisuals,
  validate,
} from 'database/db/schema';

export type { 
  JsonData,
  Grouping,
} from 'database/db/schema';

