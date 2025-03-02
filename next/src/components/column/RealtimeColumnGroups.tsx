'use client'

import React from 'react';
import clsx from 'clsx';

import Skeleton from '../common/Skeleton';
import RealtimeColumnGroup from '@/components/column/RealtimeColumnGroup';
import Button from '@/components/common/Button';

import { useRealtimeColumnGroups } from '@/hooks/useRealtimeColumnGroups';

const RealtimeColumnGroups: React.FC<
  React.ComponentProps<'div'>
  & { projectId: string }
> = ({
  projectId,
  className,
  ...props
}) => {

  const {
    columnGroups,
    addColumnGroup,
  } = useRealtimeColumnGroups({
    projectId
  });

  if (columnGroups == null) return (
    <Skeleton />
  );

  return (
    <div 
      className={clsx(
        'px-2 pb-2 m-2',
        'flex flex-col gap-4',
        className,
      )}
      {...props}
    >
      <div className='text-xl font-bold'>
        列グループ
      </div>
      {columnGroups.map(c =>
        <RealtimeColumnGroup key={c.id} columnGroup={c} />
      )}
      <div className='divider'></div>
      <Button 
        className='btn-success'
        onClick={async () => await addColumnGroup({
          name: '新しい列グループ',
          type: 'sequence',
          sort: null,
          projectId,
        })}
      >
        + 列グループの追加
      </Button>
    </div>
  );
};

export default RealtimeColumnGroups;

