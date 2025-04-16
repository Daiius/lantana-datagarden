import clsx from 'clsx';

import type {
  MeasurementColumn as MeasurementColumnType,
} from '@/types';
import { DataTypes } from '@/types';

import { useMeasurementColumn } from '@/hooks/useMeasurementColumn';

import {
  IconTrash
} from '@tabler/icons-react';

import Button from '@/components/common/Button';
import DebouncedInput from '@/components/common/DebouncedInput';
import DebouncedSelect from '@/components/common/DebouncedSelect';
import Skeleton from '@/components/common/Skeleton';

export type MeasurementColumnProps = {
  initialValue: MeasurementColumnType

  className?: string;
}

const MeasurementColumn = ({
  initialValue,
  className,
}: MeasurementColumnProps) => {
  const { 
    data: column,
    update,
    remove,
  } = useMeasurementColumn({ 
    initialData: initialValue
  });

  if (column == null) return (
    <Skeleton />
  );

  return (
    <div 
      className={clsx('text-lg flex flex-row', className)}
    >
      <fieldset className='fieldset'>
        <label className='fieldset-label'>
          列名：
        </label>
        <DebouncedInput
          value={column.name}
          debouncedOnChange={async newValue => {
            await update({ ...column, name: newValue as string })
          }}
        />
      </fieldset>
      <fieldset className='fieldset'>
        <label className='fieldset-label'>
          型：
        </label>
        <DebouncedSelect
          value={column.type}
          options={DataTypes}
          debouncedOnChange={async (newValue) => {
            await update({ ...column, type: newValue })
          }}
        />
      </fieldset>
      {/* TODO 手動で位置を調整してしまっている...... */}
      <Button 
        className='text-error ml-8 mt-7'
        onClick={async () => await remove({
          projectId: column.projectId,
          columnGroupId: column.columnGroupId,
          id: column.id,
        })}
      >
        <IconTrash />
      </Button>
    </div>
  );
};

export default MeasurementColumn;

