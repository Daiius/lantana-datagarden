'use client' // for hook, useMeasurementColumnGroups

import clsx from 'clsx';

import { useMeasurementColumnGroups } from '@/hooks/useMeasurementColumnGroups';
import { useMeasurementColumnGroupMutations } from '@/hooks/useMeasurementColumnGroupMutations';

import Button from '@/components/common/Button';

export type AddMeasurementDropdownArgs = {
  projectId: string;
  columnGroupId: number;
  /** 選択肢から除外する測定名を指定します */
  nameFilter?: string[];
};

export const AddMeasurementDropdown = ({
  projectId,
  columnGroupId,
  nameFilter = [],
}: AddMeasurementDropdownArgs) => {

  const { data: measurements } = useMeasurementColumnGroups({ projectId });
  const { add } = useMeasurementColumnGroupMutations();

  return (
    <div className='dropdown'>
      <div 
        tabIndex={0} 
        role='button' 
        className={clsx(
          'btn btn-accent btn-soft',
          measurements.length === 0 && 'btn-disabled',
        )}
      >
        測定を追加
        {measurements.length === 0 &&
          ': 設定が必要です...'
        }
      </div>
      <div
        tabIndex={0}
        className='dropdown-content bg-base-100 rouded-boz z-1 p-2 shadow-sm'
      >
        {measurements?.map(measurement =>
          <Button
            className='text-nowrap'
            key={measurement.id}
            disabled={nameFilter.includes(measurement.name)}
            onClick={async () => await add({
              projectId,
              columnGroupId,
              measurementColumnGroupId: measurement.id,
              visual: 'presence',
            })}
          >
            {measurement.name}
          </Button>
        )}
      </div>
    </div>
  );
};


