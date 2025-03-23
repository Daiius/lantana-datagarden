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

const TableCell: React.FC<
  React.ComponentProps<'input'>
  & {
    column: Column;
    tanstackColumn: TanstackColumn<Data>;
    row: TanstackRow<Data>;
    table: TanstackTable<Data>;
  }
> = ({
  row,
  column,
  tanstackColumn,
  table,
  className,
  ...props
}) => {
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
      {...props}
    />
  );
};

export default TableCell;

