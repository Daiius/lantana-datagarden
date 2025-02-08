import { 
  projects,
  categories,
} from 'database/db/schema';

export type Project = typeof projects.$inferSelect;
export type Category = typeof categories.$inferSelect;

export { 
  COLUMN_DEFINITION_DATA_TYPES as DataTypes
} from 'database/db/schema';

