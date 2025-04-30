'use client'

import clsx from 'clsx';

import type {
  MeasurementColumn,
  Measurement,
} from '@/types';

import {
  Row,
  Table,
} from '@tanstack/react-table';

import  { IconMinus } from '@tabler/icons-react';

import Input from '@/components/common/Input';


export type MeasurementTableCellProps = {
  column: MeasurementColumn;
  row: Row<Measurement>;
  table: Table<Measurement>;
  update: (newMeasurement: Measurement) => Promise<void>;

  className?: string;
}

const MeasurementTableCell = ({
  column,
  row,
  update,
  table,
  className,
}: MeasurementTableCellProps) => {

  const data = row.original;
  
  if (!(column.name in data.data)) {
    return <IconMinus className='size-3 ml-auto mr-auto'/>
  }

  return (
    <Input
      className={clsx('input-ghost', className)}
      value={data.data[column.name]}
      validation={column.type !== 'string' ? 'number' : undefined}
      onChange={async newValue => await update({ 
          ...data, 
          data: { ...data.data, [column.name]: newValue }
      })}
    />
    
  );
};

export default MeasurementTableCell;

