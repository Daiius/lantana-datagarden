import { 
  projects,
  categories,
  columnDefinitions,
} from 'database/db/schema';

export type Project  = typeof projects.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Column   = typeof columnDefinitions.$inferSelect;

export { 
  COLUMN_DEFINITION_DATA_TYPES as DataTypes
} from 'database/db/schema';

