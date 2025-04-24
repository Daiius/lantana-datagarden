import clsx from 'clsx';

import type {
  MeasurementColumn as MeasurementColumnType,
} from '@/types';
import { DataTypes } from '@/types';

import { useMeasurementColumnMutations } from '@/hooks/useMeasurementColumnMutations';

import {
  IconTrash
} from '@tabler/icons-react';

import Button from '@/components/common/Button';
import DebouncedInput from '@/components/common/DebouncedInput';
import { Select } from '@/components/common/Select';
import Skeleton from '@/components/common/Skeleton';

export type MeasurementColumnProps = {
  column: MeasurementColumnType

  className?: string;
}

const MeasurementColumn = ({
  column,
  className,
}: MeasurementColumnProps) => {

  // TODO 内部でstateを保持し、debounceしてDBに同期する仕組みが必要
  const {
    update,
    remove,
  } = useMeasurementColumnMutations();

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
        <Select
          value={column.type}
          onChange={async (newValue) => {
            newValue &&
              await update({ ...column, type: newValue as typeof DataTypes[number] });
          }}
        >
          {DataTypes.map(dataType =>
            <option value={dataType}>{dataType}</option>
          )}
        </Select>
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

