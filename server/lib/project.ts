import { db } from 'database/db';
import { projects } from 'database/db/schema';
import { eq } from 'drizzle-orm';

type Project = typeof projects.$inferSelect;

/**
 * 指定したIDのprojectを取得します
 * TODO orderByを適切に指定できるよう、作成日時を追加したい
 */
export const get = async ({ id }: Pick<Project, 'id'>) =>
   await db.query.projects.findFirst({
     where: eq(projects.id, id),
   });

/**
 * プロジェクトのリストを取得します
 *  TODO ユーザが属するプロジェクトだけ返却する様に！
 */
export const list = async () =>
  await db.query.projects.findMany();

/**
 * プロジェクトを更新します
 */
export const update = async(
  // NOTE ユーザにはlastSelectedFlowを直接編集させません
  project: Omit<Project, 'lastSelectedFlow'>
) => {
  await db.update(projects)
    .set(project)
    .where(eq(projects.id, project.id));
  // MySQL + Drizzle ORM では（というかMySQLがサポートしていない？）
  // ので、自力で取得します。
  // 同時編集などが有った場合には食い違う結果が返る場合が有りますが、
  // 現在は別にそれを防ぐ実装にしていないのでtransactionは使いません
  const newProject = await get(project);
  if (newProject == null) throw new Error(
    `cannot find updated project, ${project.id}`
  );
  return newProject;
}

