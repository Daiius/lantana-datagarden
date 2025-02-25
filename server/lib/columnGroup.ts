
import { db } from 'database/db';
import { 
  columnGroups,
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

export const getNestedColumnGroups = async ({
  projectId
}: {
  projectId: string
}) => await db.query.columnGroups.findMany({
  where: eq(columnGroups.projectId, projectId),
  with: {
    columns: true
  }
});

