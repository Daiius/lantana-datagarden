import clsx from 'clsx';


import { IconTrash } from '@tabler/icons-react';

import { 
  MeasurementColumnGroup as MeasurementColumnGroupType,
  MeasurementColumnGroupWithColumns,
} from '@/types';

import { useMeasurementColumnGroup } from '@/hooks/useMeasurementColumnGroup';

import Skeleton from '@/components/common/Skeleton';
import Button from '@/components/common/Button';
import DebouncedInput from '@/components/common/DebouncedInput';

import MeasurementColumns from '@/components/measurements/MeasurementColumns';

export type MeasurementColumnGroupProps<
  T extends MeasurementColumnGroupType
> = {
  initialValue: T;
  className?: string;
}

const MeasurementColumnGroup = <
  T extends MeasurementColumnGroupWithColumns,
>({
  initialValue,
  className,
}: MeasurementColumnGroupProps<T>) => {

  const { projectId, id } = initialValue;
 
  const { 
    data, 
    update,
    remove, 
  } = useMeasurementColumnGroup({ initialData: initialValue });

  if (data == null) {
    return <Skeleton />
  }

  return (
    <div
      className={clsx(
        'rounded-lg border border-base-100',
        'p-4',
        'bg-base-200',
        className,
      )}
    >
      <div className='flex flex-row'>
        <fieldset className='fieldset'>
          <label className='fieldset-label'>
            列グループ名:
          </label>
          <DebouncedInput
            value={data.name}
            debouncedOnChange={async newValue => {
              await update(
                { ...data, name: newValue as string }
              );
            }}
          />
        </fieldset>
        <Button 
          className='text-error ms-auto'
          onClick={async () => await remove({ 
            projectId: data.projectId,
            id: data.id,
          })}
        >
          <IconTrash />
        </Button>
      </div>
      <MeasurementColumns 
        projectId={projectId}
        columnGroupId={id}
        initialValue={data.columns} 
      />
    </div>
  );
};

export default MeasurementColumnGroup;

