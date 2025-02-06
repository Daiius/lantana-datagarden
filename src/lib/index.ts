import { db } from '@/db';
import { eq } from 'drizzle-orm';
import {
  projects,
} from '@/db/schema';

/**
 * Project, Category, ColumnDefinitions をネストしたオブジェクトで
 * まとめて取得します
 *
 * もちろん段階的に取得する方法も有るのですが、
 * データ量は莫大にはならないだろうからこの方が効率的だと判断しました
 */
export const getProjectData = async (projectId: string) => {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      categories: {
        orderBy: (categories, { asc }) => [
          asc(categories.id),
          asc(categories.sort),
        ],
        with: { 
          columns: {
            orderBy: (columns, { asc }) => [
              asc(columns.id),
              asc(columns.sort),
            ],
          }
        },
      }
    }
  });
  return project;
};

