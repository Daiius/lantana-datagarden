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

import { useMeasurement } from '@/hooks/useMeasurement';
import { useMeasurementMutations } from '@/hooks/useMeasurementMutations';
import DebouncedInput from '@/components/common/DebouncedInput';


export type MeasurementTableCellProps = {
  column: MeasurementColumn;
  row: Row<Measurement>;
  table: Table<Measurement>;

  className?: string;
}

const MeasurementTableCell = ({
  column,
  row,
  table,
  className,
}: MeasurementTableCellProps) => {
  const { data } = useMeasurement({
    initialData: row.original,
    useSubscription: false,
  });
  const { update } = useMeasurementMutations();
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

export default MeasurementTableCell;

