'use client'

import React from 'react';
import clsx from 'clsx';

import {
  Table as TanstackTable,
  Column as TanstackColumn,
  Row as TanstackRow,
} from '@tanstack/react-table';

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
  const { data, updateData } = useData({
    id, projectId, columnGroupId
  });
  if (data == null) return <div>loading...</div>
  return (
    <DebouncedInput
      className={clsx('input-ghost', className)}
      value={data.data[column.name]}
      validation={column.type !== 'string' ? 'number' : undefined}
      debouncedOnChange={async newValue =>
        updateData({ 
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

