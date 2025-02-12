import { 
  projects,
  categories,
  columnDefinitions,
  data,
} from 'database/db/schema';

import type {
  getProjectData
} from '@/lib';

export type Project  = typeof projects.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Column   = typeof columnDefinitions.$inferSelect;
export type Data     = typeof data.$inferSelect;

export type ProjectCategoriesColumns = NonNullable<
  Awaited<ReturnType<typeof getProjectData>>
>;

export type ArrayElement<T> = T extends (infer U)[] ? U : never;

export type CategoryColumns = ArrayElement<
  ProjectCategoriesColumns['categories']
>;

// duplicated with Column
//export type _Column = ArrayElement<
//  CategoryColumns['columns']
//>;

export { 
  COLUMN_DEFINITION_DATA_TYPES as DataTypes,
} from 'database/db/schema';
export type { 
  JsonDataType,
} from 'database/db/schema';

