'use client'

import React from 'react';
import clsx from 'clsx';

import {
  Table as TanstackTable,
  Column as TanstackColumn,
  Row as TanstackRow,
} from '@tanstack/react-table';
import {
  IconMinus
} from '@tabler/icons-react';

import type { Data, Column } from '@/types';

import { useData } from '@/hooks/useData';
import DebouncedInput from '@/components/common/DebouncedInput';

type TableCellProps = {
  column: Column;
  tanstackColumn: TanstackColumn<Data>;
  row: TanstackRow<Data>;
  table: TanstackTable<Data>;
  className?: string;
}

const TableCell = ({
  row,
  column,
  tanstackColumn,
  table,
  className,
}: TableCellProps) => {
  const { id, projectId, columnGroupId } = row.original;
  const { data, update } = useData({
    id, projectId, columnGroupId
  });
  if (data == null) return <div>loading...</div>
  if (!(column.name in data.data)) {
    return <IconMinus className='size-3 ml-auto mr-auto'/>
  }
  return (
    <DebouncedInput
      className={clsx('input-ghost', className)}
      value={data.data[column.name]}
      validation={column.type !== 'string' ? 'number' : undefined}
      debouncedOnChange={async newValue =>
        update({ 
          ...data,
          data: {
            ...data.data,
            [column.name]: newValue
          }
        })
      }
    />
  );
};

export default TableCell;

