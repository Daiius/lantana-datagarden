import { 
  projects,
  categories,
  columnDefinitions,
  data,
} from 'database/db/schema';

export type Project  = typeof projects.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Column   = typeof columnDefinitions.$inferSelect;
export type Data     = typeof data.$inferSelect;

export { 
  COLUMN_DEFINITION_DATA_TYPES as DataTypes,
} from 'database/db/schema';
export type { 
  JsonDataType,
} from 'database/db/schema';

