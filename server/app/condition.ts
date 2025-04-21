import {
  getNested as getColumnGroup,
  listNested as listColumnGroup,
  add as addColumnGroup,
  remove as removeColumnGroup,
  update as updateColumnGroup,
} from '../lib/columnGroup';

import type {
  ColumnGroup
} from '../lib/columnGroup';

import {
  get as getColumn,
  list as listColumn,
  add as addColumn,
  remove as removeColumn,
  update as updateColumn,
} from '../lib/column';

export type TableDefinition = Awaited<ReturnType<typeof getColumnGroup>>;

/**
 * テーブル定義を取得します
 *
 */
export const getTableDefinition = async ({
  projectId,
  id,
}: {
  projectId: string,
  id: number
}) => {
  return await getColumnGroup({ id, projectId });
};

/**
 * テーブル定義を更新します
 *
 */
export const updateTableDefinition = async (newTableDefinition: Partial<TableDefinition>) => {

};


