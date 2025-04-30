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

import Input from '@/components/common/Input';

type TableCellProps = {
  column: Column;
  tanstackColumn: TanstackColumn<Data>;
  row: TanstackRow<Data>;
  table: TanstackTable<Data>;
  update: (newData: Data) => Promise<void>;
  className?: string;
}

const TableCell = ({
  row,
  column,
  tanstackColumn,
  table,
  update,
  className,
}: TableCellProps) => {
  const { data } = row.original;
  if (!(column.name in data)) {
    return <IconMinus className='size-3 ml-auto mr-auto'/>
  }
  return (
    <Input
      className={clsx('input-ghost', className)}
      value={data[column.name]}
      validation={column.type !== 'string' ? 'number' : undefined}
      onChange={async newValue => {
        await update({ 
          ...row.original, data: { ...data, [column.name]: newValue }
        });
        console.log('newValue: %o', newValue);
      }}
    />
  );
};

export default TableCell;

