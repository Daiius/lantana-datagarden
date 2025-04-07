'use client'

import React from 'react';
import clsx from 'clsx';


import type {
  Column as ColumnType
} from '@/types';

import Column from '@/components/column/Column';
import Button from '@/components/common/Button';

import { useColumns } from '@/hooks/useColumns';

type ColumnsProps = {
  projectId: string;
  columnGroupId: number;
  initialColumns: ColumnType[]; 

  className?: string;
};

const Columns = ({
  columnGroupId,
  projectId,
  initialColumns,
  className,
}: ColumnsProps) => {

  const {
    columns,
    addColumn,
  } = useColumns({
    initialColumns,
    projectId,
    columnGroupId,
  });

  return (
    <div
      className={clsx(
        'bg-base-100 rounded-lg',
        'p-4',
        'flex flex-col gap-2',
        className,
      )}
    >
      {columns?.map(c =>
        <Column key={c.id} initialColumn={c} />
      )}
      <Button 
        className='btn-success'
        onClick={async () => {
          console.log('Adding column to column group, ', columnGroupId);
          await addColumn({
            name: '',
            projectId,
            columnGroupId,
            type: 'string',
            sort: null,
          });
        }}
      >
        + 列の追加
      </Button>
    </div>
  );
};

export default Columns;

