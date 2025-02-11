import React from 'react';
import clsx from 'clsx';

import { db } from 'database/db';
import {
  columnDefinitions,
  data,
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

import type { 
  Column,
  Category,
 } from '@/types';

import RealtimeTable from '@/components/table/RealtimeTable';

const Table: React.FC<{ 
  initialCategory: Category,
}> = async ({
  initialCategory,
}) => {

  const jsonData = await db.select()
    .from(data)
    .where(
      and(
        eq(data.projectId, initialCategory.projectId),
        eq(data.categoryId, initialCategory.id),
      )
    );
  const columns = await db.select()
    .from(columnDefinitions)
    .where(
      and(
        eq(columnDefinitions.projectId, initialCategory.projectId),
        eq(columnDefinitions.categoryId, initialCategory.id),
      )
    );
       
  return (
    <RealtimeTable
      columns={columns}
      data={jsonData}
    />
    //<div>Dummy Table</div>
  );
};

export default Table;

