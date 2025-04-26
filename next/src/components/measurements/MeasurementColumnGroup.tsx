import clsx from 'clsx';


import { IconTrash } from '@tabler/icons-react';

import { 
  MeasurementColumnGroup as MeasurementColumnGroupType,
} from '@/types';

import type { useMeasurementColumnGroups } from '@/hooks/useMeasurementColumnGroups';

import Skeleton from '@/components/common/Skeleton';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

import MeasurementColumns from '@/components/measurements/MeasurementColumns';

export type MeasurementColumnGroupProps = 
  & Pick<ReturnType<typeof useMeasurementColumnGroups>, 'update'|'remove'>
  & {
      columnGroup: MeasurementColumnGroupType;
      className?: string;
    };

const MeasurementColumnGroup = ({
  columnGroup,
  update,
  remove,
  className,
}: MeasurementColumnGroupProps) => {

  if (columnGroup == null) {
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
          <Input
            value={columnGroup.name}
            onChange={async newValue => {
              await update(
                { ...columnGroup, name: newValue as string }
              );
            }}
          />
        </fieldset>
        <Button 
          className='text-error ms-auto'
          onClick={async () => await remove({ 
            projectId: columnGroup.projectId,
            id: columnGroup.id,
          })}
        >
          <IconTrash />
        </Button>
      </div>
      <MeasurementColumns 
        projectId={columnGroup.projectId}
        columnGroupId={columnGroup.id}
      />
    </div>
  );
};

export default MeasurementColumnGroup;

