'use client'

import React from 'react';
import clsx from 'clsx';


import type {
  Column
} from '@/types';

import RealtimeColumn from '@/components/column/RealtimeColumn';
import Button from '@/components/common/Button';

import { useRealtimeColumns } from '@/hooks/useRealtimeColumns';

const RealtimeColumns: React.FC<
  React.ComponentProps<'div'>
  & { 
    projectId: string;
    columnGroupId: string;
    initialColumns: Column[]; 
  }
> = ({
  columnGroupId,
  projectId,
  initialColumns,
  className,
  ...props
}) => {

  const {
    columns,
    addColumn,
  } = useRealtimeColumns({
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
      {...props}
    >
      {columns.map(c =>
        <RealtimeColumn key={c.id} initialColumn={c} />
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

export default RealtimeColumns;

