'use client';

import clsx from 'clsx';

import { useMeasurementColumnGroups } from '@/hooks/useMeasurementColumnGroups';

import Skeleton from '@/components/common/Skeleton';
import Button from '@/components/common/Button';

import MeasurementColumnGroup from '@/components/measurements/MeasurementColumnGroup';

export type MeasurementColumnGroupsProps = {
  projectId: string;

  className?: string;
}

const MeasurementColumnGroups = ({
  projectId,
  className,
}: MeasurementColumnGroupsProps) => {
  const {
    data: columnGroups,
    isLoading,
    add,
    update,
    remove,
  } = useMeasurementColumnGroups({ projectId });

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div
      className={clsx(
        'px-2 pb-2 m-2',
        'flex flex-col gap-4',
        'animate-fade-in',
        className,
      )}
    >
      <div className='text-xl font-bold'>
        測定列グループ
      </div>
      {columnGroups.map(columnGroup =>
        <MeasurementColumnGroup 
          key={columnGroup.id}
          columnGroup={columnGroup}
          update={update}
          remove={remove}
        />
      )}
      <div className='divider' />
      <Button
        className='btn btn-accent btn-soft'
        onClick={async () => await add({
          name: '新しい測定列グループ',
          sort: null,
          projectId,
        })}
      >
        +測定列グループの追加
      </Button>
    </div>
  );
};

export default MeasurementColumnGroups;

