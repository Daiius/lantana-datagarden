import clsx from 'clsx';

import { DataTypes } from '@/types';
import type { MeasurementColumn as MeasurementColumnType } from '@/types';


import {
  IconTrash
} from '@tabler/icons-react';

import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import Skeleton from '@/components/common/Skeleton';

import type { useMeasurementColumns } from '@/hooks/useMeasurementColumns';

export type MeasurementColumnProps = 
  & { column: MeasurementColumnType; }
  & Pick<ReturnType<typeof useMeasurementColumns>, 'remove'|'update'>
  & { className?: string; };

const MeasurementColumn = ({
  column,
  update,
  remove,
  className,
}: MeasurementColumnProps) => {

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
        <Input
          value={column.name}
          onChange={async newValue => {
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
            <option key={dataType} value={dataType}>{dataType}</option>
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

