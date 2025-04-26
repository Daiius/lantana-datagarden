'use client'

import React from 'react';
import clsx from 'clsx';


import Column from '@/components/column/Column';
import Button from '@/components/common/Button';

import { useColumns } from '@/hooks/useColumns';

type ColumnsProps = {
  projectId: string;
  columnGroupId: number;

  className?: string;
};

const Columns = ({
  columnGroupId,
  projectId,
  //initialColumns,
  className,
}: ColumnsProps) => {

  const {
    data: columns,
    add,
    update,
    remove,
  } = useColumns({
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
      {columns?.map(column =>
        <Column 
          key={column.id} 
          column={column} 
          update={update}
          remove={remove}
        />
      )}
      <Button 
        className='btn-success'
        onClick={async () => await add({
          name: '',
          projectId,
          columnGroupId,
          isOptional: false,
          type: 'string',
          sort: null,
        })}
      >
        + 列の追加
      </Button>
    </div>
  );
};

export default Columns;

