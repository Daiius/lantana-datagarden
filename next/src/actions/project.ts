'use server'

import { db } from 'database/db';
import { eq } from 'drizzle-orm';
import { projects } from 'database/db/schema';

export const updateProjectName = async (
  projectId: string,
  newProjectName: string,
) => {
  await db.update(projects)
    .set({ name: newProjectName })
    .where(eq(projects.id, projectId));
}
